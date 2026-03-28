import { describe, expect, it } from 'vitest';
import { assertIsNever } from './types.js';

describe('assertIsNever', () => {
  it('throws with a useful runtime message when called with a non-never value', () => {
    expect(() => assertIsNever('unexpected-value' as never)).toThrowError(
      'Expected never, but got unexpected-value',
    );
  });

  it('includes non-string values in the thrown message', () => {
    expect(() => assertIsNever(42 as never)).toThrowError(
      'Expected never, but got 42',
    );
  });
});
