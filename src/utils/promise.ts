export type CancellablePromise<T> = Promise<T> & Pick<AbortController, 'abort'>;
