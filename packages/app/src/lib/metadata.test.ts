import { extractMeta, normalizeAuthor, parsePersonString } from './metadata.js';

describe('metadata', () => {
  describe('parsePersonString', () => {
    it('parses name only', () => {
      expect(parsePersonString('Just A Name')).toEqual({ name: 'Just A Name' });
    });

    it('parses name + email', () => {
      expect(parsePersonString('Alice <alice@example.com>')).toEqual({
        name: 'Alice',
        email: 'alice@example.com',
      });
    });

    it('parses name + url', () => {
      expect(parsePersonString('Bob (http://bob.example.com)')).toEqual({
        name: 'Bob',
        url: 'http://bob.example.com',
      });
    });

    it('parses npm person string', () => {
      expect(
        parsePersonString(
          'Barney Rubble <barney@npmjs.com> (http://barnyrubble.npmjs.com/)',
        ),
      ).toEqual({
        name: 'Barney Rubble',
        email: 'barney@npmjs.com',
        url: 'http://barnyrubble.npmjs.com/',
      });
    });
  });

  describe('normalizeAuthor', () => {
    it('normalizes author string', () => {
      expect(normalizeAuthor('Solo Artist')).toEqual({ name: 'Solo Artist' });
    });

    it('normalizes author object', () => {
      expect(
        normalizeAuthor({
          name: 'Charlie',
          email: 'charlie@example.com',
          url: 'http://charlie.com',
        }),
      ).toEqual({
        name: 'Charlie',
        email: 'charlie@example.com',
        url: 'http://charlie.com',
      });
    });

    it('returns null for invalid object', () => {
      expect(normalizeAuthor({ email: 'no-name@example.com' })).toBeNull();
    });

    it('returns null for invalid type', () => {
      expect(normalizeAuthor(123)).toBeNull();
    });
  });

  describe('extractMeta', () => {
    it('returns empty object for absent or invalid meta', () => {
      expect(extractMeta(undefined)).toEqual({ meta: {}, warnings: [] });
      expect(extractMeta(null)).toEqual({
        meta: {},
        warnings: [
          { key: 'meta', message: 'Expected export "meta" to be an object' },
        ],
      });
      expect(extractMeta('oops')).toEqual({
        meta: {},
        warnings: [
          { key: 'meta', message: 'Expected export "meta" to be an object' },
        ],
      });
    });

    it('extracts known fields and always normalizes to arrays', () => {
      expect(
        extractMeta({
          title: 'My Song',
          album: ['My Album'],
          license: 'CC BY-NC-SA-4.0',
          details: 'Cool stuff',
          url: ['https://example.com'],
          genre: 'ambient',
        }),
      ).toEqual({
        meta: {
          title: ['My Song'],
          album: ['My Album'],
          license: ['CC BY-NC-SA-4.0'],
          details: ['Cool stuff'],
          url: ['https://example.com'],
          genre: ['ambient'],
        },
        warnings: [],
      });
    });

    it('drops non-string scalar fields and emits warnings', () => {
      expect(extractMeta({ title: 42, album: false, details: null })).toEqual({
        meta: {},
        warnings: [
          {
            key: 'title',
            message: 'Dropped non-string value in metadata "title"',
          },
          {
            key: 'album',
            message: 'Dropped non-string value in metadata "album"',
          },
          {
            key: 'details',
            message: 'Dropped non-string value in metadata "details"',
          },
        ],
      });
    });

    it('emits summary warning for empty string arrays', () => {
      expect(extractMeta({ details: [] })).toEqual({
        meta: {},
        warnings: [
          {
            key: 'details',
            message:
              'Dropped metadata "details" because it has no valid string values',
          },
        ],
      });
    });

    it('array-izes single authors values before parsing', () => {
      expect(
        extractMeta({
          authors: 'Solo Artist <solo@example.com>',
        }),
      ).toEqual({
        meta: {
          authors: [{ name: 'Solo Artist', email: 'solo@example.com' }],
        },
        warnings: [],
      });
    });

    it('does not support author and warns to use authors', () => {
      expect(extractMeta({ author: 'Author A' })).toEqual({
        meta: {},
        warnings: [
          {
            key: 'author',
            message:
              'Metadata key "author" is not supported. Use "authors" instead',
          },
        ],
      });
    });

    it('supports authors as array of strings and objects', () => {
      expect(
        extractMeta({
          authors: [
            'Alice <alice@example.com>',
            { name: 'Bob', url: 'http://bob.com' },
          ],
        }),
      ).toEqual({
        meta: {
          authors: [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', url: 'http://bob.com' },
          ],
        },
        warnings: [],
      });
    });

    it('filters invalid author entries and emits warnings', () => {
      expect(extractMeta({ authors: [null, 42, 'Valid <v@v.com>'] })).toEqual({
        meta: {
          authors: [{ name: 'Valid', email: 'v@v.com' }],
        },
        warnings: [
          {
            key: 'authors',
            message:
              'Dropped invalid author entry. Expected a string or object with string "name"',
          },
          {
            key: 'authors',
            message:
              'Dropped invalid author entry. Expected a string or object with string "name"',
          },
        ],
      });
    });

    it('accepts unknown keys as string or string arrays', () => {
      expect(
        extractMeta({
          mood: 'uplifting',
          instrumentation: ['synth', 'bass'],
        }),
      ).toEqual({
        meta: {
          mood: ['uplifting'],
          instrumentation: ['synth', 'bass'],
        },
        warnings: [],
      });
    });

    it('drops invalid unknown key values and emits warnings', () => {
      expect(
        extractMeta({
          mood: ['uplifting', 3, false],
        }),
      ).toEqual({
        meta: {
          mood: ['uplifting'],
        },
        warnings: [
          {
            key: 'mood',
            message: 'Dropped non-string value in metadata "mood"',
          },
          {
            key: 'mood',
            message: 'Dropped non-string value in metadata "mood"',
          },
        ],
      });
    });
  });
});
