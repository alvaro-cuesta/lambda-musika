import type { StereoRendererMeta } from '../lib/metadata.js';
import { dateToSortableString } from './time.js';

/**
 * Downloads a Blob object as a file.
 *
 * @param filename The name of the file to download.
 * @param blob The Blob object to download.
 */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

type LoadFileAs = 'text' | 'dataURL' | 'arrayBuffer';

type LoadFileContent<T extends LoadFileAs> = T extends 'text'
  ? string
  : T extends 'dataURL'
    ? string
    : T extends 'arrayBuffer'
      ? ArrayBuffer
      : never;

/**
 * Prompts the user to select a file and reads its content as a string.
 *
 * @param accept The accept attribute for the file input element.
 * @returns A promise that resolves to the file content as a string, or null if no file was selected.
 */
export function loadFile<T extends 'text' | 'dataURL' | 'arrayBuffer'>(
  readAs: T,
  accept?: string,
): Promise<{ name: string; content: LoadFileContent<T> } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');

    input.type = 'file';

    if (accept !== undefined) {
      input.accept = accept;
    }

    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) {
        resolve(null);
        return;
      }

      const r = new FileReader();
      r.onloadend = (e) => {
        const content = e.target?.result;

        if (content === null || content === undefined) {
          resolve(null);
        } else {
          resolve({
            name: f.name,
            content: content as LoadFileContent<T>,
          });
        }
      };

      switch (readAs) {
        case 'text':
          r.readAsText(f);
          break;
        case 'dataURL':
          r.readAsDataURL(f);
          break;
        case 'arrayBuffer':
          r.readAsArrayBuffer(f);
          break;
      }
    };

    input.click();
  });
}

function joinNonEmpty(value: string[]): string {
  return value
    .map(cleanFilenamePart)
    .filter((item) => item.length > 0)
    .join(', ');
}

function cleanFilenamePart(value: string): string {
  return (
    value
      // Clean non-filename-safe characters
      // eslint-disable-next-line no-control-regex -- this is not a mistake, we want to remove control characters
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      .trim()
  );
}

function getMetadataFileStem(meta: StereoRendererMeta): string | null {
  if (!meta.title) return null;

  const titlePart = joinNonEmpty(meta.title);
  if (titlePart.length === 0) return null;

  const authorNames = meta.authors?.map((author) => author.name);
  const authorPart = authorNames ? joinNonEmpty(authorNames) : null;

  return authorPart ? `${authorPart} - ${titlePart}` : titlePart;
}

export function getFileStem(
  meta: StereoRendererMeta,
  fallbackPrefix: string,
): string {
  const prefix = getMetadataFileStem(meta) ?? fallbackPrefix;
  const date = dateToSortableString(new Date());
  return `${prefix}_${date}`;
}
