/**
 * Worker-based PCM audio rendering utilities.
 * This splits audio rendering across multiple web workers to avoid blocking the main thread.
 */

import type { MonoRenderer, StereoRenderer, Time } from '../audio.js';
import type { WorkerMessage, WorkerResponse } from './renderPCMWorker.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Vite worker import
import type { ExceptionInfo } from '../compile.js';
import AudioRenderWorker from './audioRenderWorker?worker';
import {
  renderPcmBufferMono,
  renderPcmBufferStereo,
  type BitDepth,
  type BufferForBitDepth,
} from './PCM.js';

type RenderResult<T> =
  | { type: 'success'; buffer: T }
  | { type: 'error'; error: ExceptionInfo };

/**
 * Fallback synchronous rendering when workers are not available
 */
function renderStereoBufferFallback<
  T extends Uint8Array | Int16Array | Float32Array,
>(
  BufferType: new (length: number) => T,
  quantizerType: 'uint8' | 'int16' | 'none',
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): Promise<RenderResult<T>> {
  return new Promise((resolve) => {
    const channelLength = Math.floor(length * sampleRate);
    const buffer = new BufferType(2 * channelLength);

    function getQuantizer(type: string): (v: number) => number {
      switch (type) {
        case 'uint8':
          return (v: number) => Math.floor(((v + 1) / 2) * 0xff);
        case 'int16':
          return (v: number) => Math.floor(((v + 1) / 2) * 0xffff - 0x8000);
        case 'none':
          return (v: number) => v;
        default:
          throw new Error(`Unknown quantizer type: ${type}`);
      }
    }

    const quantize = getQuantizer(quantizerType);

    try {
      for (let i = 0; i < channelLength; i++) {
        const t = i / sampleRate;
        const [l, r] = fn(t as Time);
        buffer[i * 2] = quantize(l);
        buffer[i * 2 + 1] = quantize(r);
      }
      resolve({ type: 'success', buffer });
    } catch (e) {
      resolve({
        type: 'error',
        error: {
          name: 'RenderError',
          message: e instanceof Error ? e.message : String(e),
          fileName: '',
          row: 0,
          column: 0,
          e,
        },
      });
    }
  });
}

/**
 * Render stereo audio buffer using web workers for background processing.
 */
async function renderStereoBufferWithWorkers<
  T extends Uint8Array | Int16Array | Float32Array,
>(
  BufferType: new (length: number) => T,
  quantizerType: 'uint8' | 'int16' | 'none',
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): Promise<RenderResult<T>> {
  const channelLength = Math.floor(length * sampleRate);
  const totalSamples = channelLength;

  // Check if web workers are available
  if (typeof Worker === 'undefined') {
    // Fallback to synchronous rendering
    return renderStereoBufferFallback(
      BufferType,
      quantizerType,
      sampleRate,
      length,
      fn,
    );
  }

  // Get number of workers to use
  const numWorkers =
    (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
  const samplesPerWorker = Math.ceil(totalSamples / numWorkers);

  // Create workers
  const workers: Worker[] = [];
  const promises: Promise<WorkerResponse>[] = [];

  try {
    // Convert function to string for transmission to workers
    const fnCode = fn.toString();

    // Start workers for each chunk
    for (let i = 0; i < numWorkers; i++) {
      const startSample = i * samplesPerWorker;
      const endSample = Math.min((i + 1) * samplesPerWorker, totalSamples);

      if (startSample >= totalSamples) break; // No more work

      const worker = new AudioRenderWorker();
      workers.push(worker);

      const promise = new Promise<WorkerResponse>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent) => {
          resolve(event.data as WorkerResponse);
        };
        worker.onerror = (error: Event) => {
          reject(new Error(`Worker error: ${error.type}`));
        };
      });

      promises.push(promise);

      const message: WorkerMessage = {
        type: 'render',
        chunkIndex: i,
        startSample,
        endSample,
        sampleRate,
        fnCode,
        bufferType: BufferType.name as
          | 'Uint8Array'
          | 'Int16Array'
          | 'Float32Array',
        quantizer: quantizerType,
      };

      worker.postMessage(message);
    }

    // Wait for all workers to complete
    const results = await Promise.all(promises);

    // Clean up workers
    workers.forEach((worker) => {
      worker.terminate();
    });

    // Check for errors
    const errorResult = results.find((result) => result.type === 'error');
    if (errorResult) {
      return {
        type: 'error',
        error: {
          name: 'WorkerError',
          message: errorResult.error ?? 'Unknown worker error',
          fileName: '',
          row: 0,
          column: 0,
          e: errorResult.error,
        },
      };
    }

    // Sort results by chunk index and combine buffers
    const sortedResults = results
      .filter(
        (
          result,
        ): result is WorkerResponse & {
          type: 'success';
          buffer: ArrayBuffer;
        } => result.type === 'success' && result.buffer !== undefined,
      )
      .sort((a, b) => a.chunkIndex - b.chunkIndex);

    // Create final buffer and copy data from worker results
    const finalBuffer = new BufferType(2 * channelLength); // stereo = 2 channels
    let offset = 0;

    for (const result of sortedResults) {
      const TypedArrayConstructor = BufferType as unknown as new (
        buffer: ArrayBuffer,
      ) => T;
      const chunkView = new TypedArrayConstructor(result.buffer);
      finalBuffer.set(chunkView, offset);
      offset += chunkView.length;
    }

    return { type: 'success', buffer: finalBuffer };
  } catch (error) {
    // Clean up workers on error
    workers.forEach((worker) => {
      worker.terminate();
    });

    return {
      type: 'error',
      error: {
        name: 'WorkerError',
        message: error instanceof Error ? error.message : String(error),
        fileName: '',
        row: 0,
        column: 0,
        e: error,
      },
    };
  }
}

/**
 * Create a stereo audio buffer with 8-bit unsigned integer samples using workers.
 */
export function Uint8StereoWorker(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): Promise<RenderResult<Uint8Array<ArrayBuffer>>> {
  return renderStereoBufferWithWorkers(
    Uint8Array,
    'uint8',
    sampleRate,
    length,
    fn,
  );
}

/**
 * Create a stereo audio buffer with 16-bit signed integer samples using workers.
 */
export function Int16StereoWorker(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): Promise<RenderResult<Int16Array<ArrayBuffer>>> {
  return renderStereoBufferWithWorkers(
    Int16Array,
    'int16',
    sampleRate,
    length,
    fn,
  );
}

/**
 * Create a stereo audio buffer with 32-bit floating point samples using workers.
 */
export function Float32StereoWorker(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): Promise<RenderResult<Float32Array<ArrayBuffer>>> {
  return renderStereoBufferWithWorkers(
    Float32Array,
    'none',
    sampleRate,
    length,
    fn,
  );
}
