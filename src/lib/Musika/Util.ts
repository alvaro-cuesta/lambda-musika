/**
 * @module Functional utilities.
 */

import type { Time } from '../audio';

// Helper type to generate all valid prefixes of a tuple
type AllPrefixes<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer First]
    ? [] | [First]
    : T extends readonly [infer First, ...infer Rest]
      ? [] | [First] | [First, ...AllPrefixes<Rest>]
      : never;

/**
 * Curries a function with partial application.
 *
 * @param uncurried - The function to curry
 * @param args - The initial arguments to pre-fill
 * @returns A curried version of the function that expects the remaining arguments
 */
export function curry<
  Fn extends (this: unknown, ...args: never[]) => unknown,
  ProvidedArgs extends AllPrefixes<Parameters<Fn>>,
>(
  this: unknown,
  uncurried: Fn,
  ...args: ProvidedArgs
): CurriedFunction<Fn, ProvidedArgs> {
  return function (this: unknown, ...restArgs: RestArgs<Fn, ProvidedArgs>) {
    const allArgs = [...args, ...restArgs] as [
      ...ProvidedArgs,
      ...RestArgs<Fn, ProvidedArgs>,
    ];
    return uncurried.apply(this, allArgs as unknown as Parameters<Fn>);
  } as CurriedFunction<Fn, ProvidedArgs>;
}

type RestArgs<
  Fn extends (...args: never[]) => unknown,
  ProvidedArgs extends readonly unknown[],
> =
  Parameters<Fn> extends readonly [...ProvidedArgs, ...infer RestArgs]
    ? RestArgs
    : never;

// Type helper for curried functions
type CurriedFunction<
  Fn extends (...args: never[]) => unknown,
  ProvidedArgs extends readonly unknown[],
> = (...args: RestArgs<Fn, ProvidedArgs>) => ReturnType<Fn>;

/**
 * Choose a random element from an array
 *
 * @param array - The array to choose from
 * @returns A random element from the array or `undefined` if the array is empty
 */
export function choose<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Limit the rate of calls to a function
 *
 * @param f - The frequency (in Hz) to limit the rate to
 * @returns A function that limits the rate of calls to the given function
 */
export function LimitRate<Fn extends (...args: never[]) => unknown>(
  fn: Fn,
  f: number,
) {
  const period = (1 / f) as Time;
  let nextUpdate: Time | null = null;
  let cachedFn: () => ReturnType<Fn>;

  return function (this: unknown, t: Time) {
    nextUpdate ??= t;

    if (t < nextUpdate) {
      return cachedFn;
    }

    return function (this: unknown, ...args: Parameters<Fn>): ReturnType<Fn> {
      const v = fn.apply(this, args) as ReturnType<Fn>;
      cachedFn = () => v;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we set nextUpdate to t above and nobody else could've modified it
      nextUpdate = (nextUpdate! + period) as Time;
      return v;
    };
  };
}
