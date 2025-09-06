// Test environment global type definitions

// Vitest globals
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const vitest: {
  fn: <T extends (...args: unknown[]) => unknown>(
    fn: T,
  ) => T & {
    mockClear: () => void;
  };
};
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
declare const expectTypeOf: <T>(actual: T) => {
  toEqualTypeOf: <U>(expected?: U) => void;
};
/* eslint-enable @typescript-eslint/no-unnecessary-type-parameters */
declare const expect: (actual: unknown) => {
  toEqual: (expected: unknown) => void;
  toBe: (expected: unknown) => void;
  toThrow: (expected?: string | RegExp) => void;
  toBeDefined: () => void;
  toBeUndefined: () => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toHaveBeenCalledTimes: (times: number) => void;
  toHaveBeenCalledWith: (...args: unknown[]) => void;
};

// Web Worker types for tests
declare const Worker: (url: string | URL) => Worker;

type Worker = {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((this: Worker, ev: MessageEvent) => unknown) | null;
  onerror: ((this: Worker, ev: ErrorEvent) => unknown) | null;
  terminate: () => void;
};

type MessageEvent<T = unknown> = {
  data: T;
};

type ErrorEvent = {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: unknown;
};
