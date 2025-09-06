/// <reference types="vitest/globals" />

// Web Worker global scope types
declare global {
  var Worker: {
    prototype: Worker;
    new (scriptURL: string | URL, options?: WorkerOptions): Worker;
  };

  type Worker = {
    postMessage(message: unknown, transfer?: Transferable[]): void;
    terminate(): void;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((error: ErrorEvent) => void) | null;
  };

  type ErrorEvent = {
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: unknown;
  };
}
