/**
 * @module audioRenderWorker
 * Web Worker for rendering audio buffer chunks in the background.
 * This prevents blocking the main thread during audio generation.
 */

import type { StereoRenderer, Time } from './audio.js';
import { tryParseException } from './compile.js';
import { quantizeInt16, quantizeUint8 } from './quantizers.js';

export type WorkerMessage = {
  type: 'render';
  chunkIndex: number;
  startSample: number;
  endSample: number;
  sampleRate: number;
  fnCode: string;
  bufferType: 'Uint8Array' | 'Int16Array' | 'Float32Array';
  quantizer: 'uint8' | 'int16' | 'none';
};

export type WorkerResponse = {
  type: 'success' | 'error';
  chunkIndex: number;
  buffer?: ArrayBuffer;
  error?: string;
};

function getQuantizer(type: string): (v: number) => number {
  switch (type) {
    case 'uint8':
      return quantizeUint8;
    case 'int16':
      return quantizeInt16;
    case 'none':
      return (v: number) => v;
    default:
      throw new Error(`Unknown quantizer type: ${type}`);
  }
}

function getBufferType(
  type: string,
): new (length: number) => Uint8Array | Int16Array | Float32Array {
  switch (type) {
    case 'Uint8Array':
      return Uint8Array;
    case 'Int16Array':
      return Int16Array;
    case 'Float32Array':
      return Float32Array;
    default:
      throw new Error(`Unknown buffer type: ${type}`);
  }
}

// Handle messages from the main thread
(self as unknown as Worker).onmessage = (event: MessageEvent) => {
  const {
    chunkIndex,
    startSample,
    endSample,
    sampleRate,
    fnCode,
    bufferType,
    quantizer,
  } = event.data as WorkerMessage;

  // Since we typed the message as WorkerMessage, type is always 'render'
  // Runtime validation is handled during message parsing

  try {
    // Recreate the audio function from the code
    const fn = eval(`(${fnCode})`) as StereoRenderer;
    const BufferType = getBufferType(bufferType);
    const quantize = getQuantizer(quantizer);

    const sampleCount = endSample - startSample;
    const buffer = new BufferType(2 * sampleCount); // stereo = 2 channels

    // Render this chunk
    for (let i = 0; i < sampleCount; i++) {
      const t = (startSample + i) / sampleRate;
      try {
        const [l, r] = fn(t as Time);
        buffer[i * 2] = quantize(l);
        buffer[i * 2 + 1] = quantize(r);
      } catch (e) {
        const response: WorkerResponse = {
          type: 'error',
          chunkIndex,
          error: `Error at sample ${startSample + i}: ${tryParseException(e).message}`,
        };
        (self as unknown as Worker).postMessage(response);
        return;
      }
    }

    const arrayBuffer = buffer.buffer as ArrayBuffer;
    const response: WorkerResponse = {
      type: 'success',
      chunkIndex,
      buffer: arrayBuffer,
    };
    // Transfer the ArrayBuffer to avoid copying
    (self as unknown as Worker).postMessage(response, [arrayBuffer]);
  } catch (e) {
    const response: WorkerResponse = {
      type: 'error',
      chunkIndex,
      error: `Worker error: ${e instanceof Error ? e.message : String(e)}`,
    };
    (self as unknown as Worker).postMessage(response);
  }
};
