import { describe, expectTypeOf, it } from 'vitest';
import { assertIsNever } from './types.js';

describe('assertIsNever types', () => {
  it('keeps the function signature strict', () => {
    expectTypeOf(assertIsNever).toEqualTypeOf<(value: never) => never>();
  });

  it('returns never when called with never', () => {
    const value = null as never;
    expectTypeOf(assertIsNever(value)).toEqualTypeOf<never>();
  });

  it('rejects non-never inputs', () => {
    // @ts-expect-error assertIsNever only accepts never
    assertIsNever('not-never');
  });
});
