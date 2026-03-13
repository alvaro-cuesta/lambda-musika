type MetaAuthor = {
  name: string;
  email?: string;
  url?: string;
};

type OneOrMany<T> = T | T[];

type KnownMetadataKey =
  | 'title'
  | 'authors'
  | 'license'
  | 'details'
  | 'url'
  | 'genre'
  | 'album';

// This type is used as authoring guidance for `exports.meta` in user scripts.
export type StereoRendererMetaInput = {
  title?: OneOrMany<string>;
  authors?: OneOrMany<string | MetaAuthor>;
  license?: OneOrMany<string>;
  details?: OneOrMany<string>;
  url?: OneOrMany<string>;
  genre?: OneOrMany<string>;
  album?: OneOrMany<string>;
} & Record<string, OneOrMany<string> | undefined>;

export type StereoRendererMeta = {
  title?: string[];
  authors?: MetaAuthor[];
  license?: string[];
  details?: string[];
  url?: string[];
  genre?: string[];
  album?: string[];
} & Record<string, string[] | undefined>;

type MetadataWarning = {
  key: string;
  message: string;
};

type MetadataKeyNormalizerConfig<T> = {
  parseItem: (item: unknown) => T | null;
  droppedItemMessage: (key: string) => string;
  droppedAllMessage: (key: string) => string;
};

const STRING_METADATA_CONFIG: MetadataKeyNormalizerConfig<string> = {
  parseItem: (item) => (typeof item === 'string' ? item : null),
  droppedItemMessage: (key) => `Dropped non-string value in metadata "${key}"`,
  droppedAllMessage: (key) =>
    `Dropped metadata "${key}" because it has no valid string values`,
};

const AUTHORS_METADATA_CONFIG: MetadataKeyNormalizerConfig<MetaAuthor> = {
  parseItem: normalizeAuthor,
  droppedItemMessage: () =>
    'Dropped invalid author entry. Expected a string or object with string "name"',
  droppedAllMessage: () =>
    'Dropped metadata "authors" because it has no valid author values',
};

const KNOWN_METADATA_CONFIG: Record<
  KnownMetadataKey,
  MetadataKeyNormalizerConfig<string | MetaAuthor>
> = {
  title: STRING_METADATA_CONFIG,
  album: STRING_METADATA_CONFIG,
  license: STRING_METADATA_CONFIG,
  details: STRING_METADATA_CONFIG,
  url: STRING_METADATA_CONFIG,
  genre: STRING_METADATA_CONFIG,
  authors: AUTHORS_METADATA_CONFIG,
};

const KNOWN_KEYS = new Set<KnownMetadataKey>(
  Object.keys(KNOWN_METADATA_CONFIG) as KnownMetadataKey[],
);

export function parsePersonString(s: string): MetaAuthor {
  const match =
    /^(?<name>[^<(]*?)(?:\s*<(?<email>[^>]*)>)?(?:\s*\((?<url>[^)]*)\))?\s*$/.exec(
      s.trim(),
    );
  const groups = match?.groups as
    | { name?: string; email?: string; url?: string }
    | undefined;
  const rawName = groups?.name ?? '';
  const rawEmail = groups?.email;
  const rawUrl = groups?.url;
  const result: MetaAuthor = { name: rawName.trim() };
  if (rawEmail?.trim()) result.email = rawEmail.trim();
  if (rawUrl?.trim()) result.url = rawUrl.trim();
  return result;
}

export function normalizeAuthor(input: unknown): MetaAuthor | null {
  if (typeof input === 'string') return parsePersonString(input);
  if (
    typeof input === 'object' &&
    input !== null &&
    'name' in input &&
    typeof (input as Record<string, unknown>)['name'] === 'string'
  ) {
    const obj = input as Record<string, unknown>;
    const result: MetaAuthor = { name: (obj['name'] as string).trim() };
    if (typeof obj['email'] === 'string' && obj['email'])
      result.email = obj['email'];
    if (typeof obj['url'] === 'string' && obj['url']) result.url = obj['url'];
    return result;
  }
  return null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

type NormalizeMetadataOptions<T> = {
  key: string;
  value: unknown;
  warnings: MetadataWarning[];
  config: MetadataKeyNormalizerConfig<T>;
};

function normalizeMetadataValues<T>({
  key,
  value,
  warnings,
  config,
}: NormalizeMetadataOptions<T>): T[] | undefined {
  const { parseItem, droppedItemMessage, droppedAllMessage } = config;
  const values = toArray(value);
  let droppedCount = 0;

  const normalized = values.flatMap((item) => {
    const parsed = parseItem(item);
    if (parsed !== null) {
      return [parsed];
    }

    droppedCount += 1;
    warnings.push({ key, message: droppedItemMessage(key) });
    return [];
  });

  if (normalized.length > 0) return normalized;
  if (droppedCount === 0) {
    warnings.push({ key, message: droppedAllMessage(key) });
  }
  return undefined;
}

type ExtractMetaResult = {
  meta: StereoRendererMeta;
  warnings: MetadataWarning[];
};

export function extractMeta(rawMeta: unknown): ExtractMetaResult {
  const warnings: MetadataWarning[] = [];
  if (typeof rawMeta !== 'object' || rawMeta === null) {
    if (rawMeta !== undefined) {
      warnings.push({
        key: 'meta',
        message: 'Expected export "meta" to be an object',
      });
    }
    return { meta: {}, warnings };
  }

  const meta = rawMeta as Record<string, unknown>;
  const result: StereoRendererMeta = {};
  const knownResult = result as Record<
    KnownMetadataKey,
    string[] | MetaAuthor[] | undefined
  >;
  const anyResult = result as Record<
    string,
    string[] | MetaAuthor[] | undefined
  >;

  for (const [key, config] of Object.entries(KNOWN_METADATA_CONFIG) as [
    KnownMetadataKey,
    MetadataKeyNormalizerConfig<string | MetaAuthor>,
  ][]) {
    const value = meta[key];
    if (value === undefined) continue;

    const normalized = normalizeMetadataValues({
      key,
      value,
      warnings,
      config,
    });
    if (normalized) {
      knownResult[key] = normalized as string[] | MetaAuthor[];
    }
  }

  for (const [key, value] of Object.entries(meta)) {
    if (KNOWN_KEYS.has(key as KnownMetadataKey)) continue;

    if (key === 'author') {
      warnings.push({
        key,
        message:
          'Metadata key "author" is not supported. Use "authors" instead',
      });
      continue;
    }

    const normalized = normalizeMetadataValues({
      key,
      value,
      warnings,
      config: STRING_METADATA_CONFIG,
    });
    if (normalized) {
      anyResult[key] = normalized;
    }
  }

  return { meta: result, warnings };
}
