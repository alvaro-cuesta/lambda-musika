import type { CancellablePromise } from '../../utils/promise.js';
import type { ExceptionInfo } from '../compile.js';
import type { BitDepth, BufferForBitDepth } from './PCM.js';
import type {
  RenderPCMWorkerRequest,
  RenderPCMWorkerResponse,
} from './renderPCMWorker.worker.js';
import renderPCMWorkerWorker from './renderPCMWorker.worker.js?worker';

export class RenderPCMWorkerError extends Error {
  error: ExceptionInfo;

  constructor(message: string, error: ExceptionInfo) {
    super(message);
    this.error = error;
  }
}

export function launchRenderPCMWorker<Bd extends BitDepth>(
  taskId: string,
  chunkIdx: number,
  bitDepth: Bd,
  sampleRate: number,
  startSample: number,
  endSample: number,
  fnCode: string,
): CancellablePromise<BufferForBitDepth<Bd>> {
  const worker = new renderPCMWorkerWorker({
    name: `renderPCMWorker.worker(${taskId})[${chunkIdx}]`,
  });

  const abortController = new AbortController();

  abortController.signal.addEventListener(
    'abort',
    () => {
      worker.terminate();
    },
    { once: true },
  );

  function sendMessage(message: RenderPCMWorkerRequest): void {
    worker.postMessage(message);
  }

  const promise = new Promise<BufferForBitDepth<Bd>>((resolve, reject) => {
    worker.addEventListener(
      'message',
      (event: MessageEvent<RenderPCMWorkerResponse<Bd>>) => {
        const response = event.data;

        switch (response.type) {
          case 'compile-error': {
            reject(
              new RenderPCMWorkerError(
                'Error while compiling rendering function',
                response.error,
              ),
            );
            return;
          }
          case 'render-result': {
            switch (response.result.type) {
              case 'success': {
                resolve(response.result.buffer);
                return;
              }
              case 'error': {
                reject(
                  new RenderPCMWorkerError(
                    'Error while rendering audio chunk',
                    response.result.error,
                  ),
                );
                return;
              }
            }
          }
        }
      },
      { once: true },
    );

    worker.addEventListener(
      'error',
      (error: ErrorEvent) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- is there anything else I can do?
        reject(error);
      },
      { once: true },
    );

    sendMessage({
      bitDepth,
      sampleRate,
      startSample,
      endSample,
      fnCode,
    });
  }).finally(() => {
    worker.terminate();
  });

  return Object.assign(promise, {
    abort: abortController.abort.bind(abortController),
  });
}
