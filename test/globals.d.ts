// Test environment global type definitions

// Vitest globals
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => {
  toEqual: (expected: any) => void;
  toBe: (expected: any) => void;
  toThrow: (expected?: string | RegExp) => void;
  toBeDefined: () => void;
  toBeUndefined: () => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
};

// Web Worker types for tests
declare const Worker: {
  new (url: string | URL): Worker;
};

interface Worker {
  postMessage(message: any, transfer?: Transferable[]): void;
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
  onerror: ((this: Worker, ev: ErrorEvent) => any) | null;
  terminate(): void;
}

interface MessageEvent<T = any> {
  data: T;
}

interface ErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: any;
}