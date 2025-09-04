import { curry } from './Util.js';

describe('curry', () => {
  const originalFunction = (s: string, n: number) => s.length + n;

  it('returns a function with the correct type', () => {
    const curried = curry(originalFunction, 'test');
    expectTypeOf(curried).toEqualTypeOf<(y: number) => number>();
  });

  it('allowd currying with no arguments', () => {
    const curried = curry(originalFunction);
    expectTypeOf(curried).toEqualTypeOf<(x: string, y: number) => number>();
  });

  describe('incorrect currying', () => {
    it('rejects incorrect argument types when currying', () => {
      // @ts-expect-error -- Argument of type 'number' is not assignable to parameter of type '{ name: string; }'.
      curry(originalFunction, 42);
      // I don't think this can be checked? Can we fource return of "never" when passing wrong params? Doeesn't seem like it
      // expectTypeOf(curried).toBeNever()
    });

    it('rejects too many arguments when currying', () => {
      // @ts-expect-error -- Source has 3 element(s) but target allows only 2
      curry(originalFunction, 'hello', 42, 43);
      // I don't think this can be checked? Can we fource return of "never" when passing wrong params? Doeesn't seem like it
      // expectTypeOf(curried).toBeNever()
    });
  });

  describe('returned function', () => {
    const curried = curry(originalFunction, 'hello');

    it('rejects incorrect argument types on the returned function', () => {
      // @ts-expect-error -- Argument of type 'string' is not assignable to parameter of type 'number'.
      curried('not a number');
      // I don't think this can be checked? Can we fource return of "never" when passing wrong params? Doeesn't seem like it
      // expectTypeOf(curriedResult).toBeNever()
    });

    it('rejects too many arguments on the returned function', () => {
      // @ts-expect-error -- Expected 1 arguments, but got 2.
      curried(42, 'extra arg');
      // I don't think this can be checked? Can we fource return of "never" when passing wrong params? Doeesn't seem like it
      // expectTypeOf(curriedResult).toBeNever()
    });

    it('rejects too few arguments on the returned function', () => {
      // @ts-expect-error -- Expected 1 arguments, but got 0.
      curried();
      // I don't think this can be checked? Can we fource return of "never" when passing wrong params? Doeesn't seem like it
      // expectTypeOf(curriedResult).toBeNever()
    });
  });
});
