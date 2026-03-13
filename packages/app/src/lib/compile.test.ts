import { compile } from './compile.js';

const RENDER = 'exports.render = () => [0, 0]';

describe('compile', () => {
  it('returns success for a valid renderer', () => {
    const result = compile(RENDER, 44100);
    expect(result.type).toBe('success');
    if (result.type === 'success') {
      expect(result.length).toBeNull();
      expect(result.meta).toEqual({});
      expect(result.warnings).toEqual([]);
    }
  });

  it('returns error for invalid syntax', () => {
    const result = compile('const x = !!!;', 44100);
    expect(result.type).toBe('error');
  });

  it('returns error when exports.render is missing', () => {
    const result = compile('exports.meta = { title: "No render" }', 44100);
    expect(result.type).toBe('error');
  });

  it('returns error when exports.length has invalid type', () => {
    const result = compile(`${RENDER}\nexports.length = '10'`, 44100);
    expect(result.type).toBe('error');
  });

  it('returns error when render throws during validation call', () => {
    const result = compile(
      'exports.render = () => { throw new Error("boom") }',
      44100,
    );
    expect(result.type).toBe('error');
  });

  it('accepts numeric exports.length', () => {
    const result = compile(`${RENDER}\nexports.length = 12`, 44100);
    expect(result.type).toBe('success');
    if (result.type === 'success') {
      expect(result.length).toBe(12);
      expect(result.warnings).toEqual([]);
    }
  });

  it('keeps compile successful and returns warnings for invalid metadata', () => {
    const result = compile(
      `${RENDER}\nexports.meta = { title: 123, authors: [null], mood: ["ok", 3] }`,
      44100,
    );
    expect(result.type).toBe('success');
    if (result.type === 'success') {
      expect(result.meta).toEqual({ mood: ['ok'] });
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.every((warning) => warning.name === 'MetadataWarning'),
      ).toBe(true);
    }
  });
});
