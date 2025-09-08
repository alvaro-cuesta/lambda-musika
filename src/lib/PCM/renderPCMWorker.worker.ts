/**
 * @module
 * Web Worker for rendering audio buffer chunks in the background.
 * This prevents blocking the main thread during audio generation.
 */

import { compile, type ExceptionInfo } from '../compile.js';
import {
  renderPcmBufferStereoChunk,
  type BitDepth,
  type RenderResult,
} from './PCM.js';

export type RenderPCMWorkerRequest = {
  bitDepth: BitDepth;
  sampleRate: number;
  startSample: number;
  endSample: number;
  fnCode: string;
};

export type RenderPCMWorkerResponse<Bd extends BitDepth> =
  | {
      type: 'render-result';
      result: RenderResult<Bd>;
    }
  | {
      type: 'compile-error';
      error: ExceptionInfo;
    };

self.onmessage = (event: MessageEvent<RenderPCMWorkerRequest>) => {
  const { bitDepth, sampleRate, startSample, endSample, fnCode } = event.data;

  const compileResult = compile(fnCode, sampleRate);

  switch (compileResult.type) {
    case 'error': {
      sendMessage({
        type: 'compile-error',
        error: compileResult.error,
      });
      return;
    }
    case 'infinite': {
      throw new TypeError('Rendering function has infinite length.');
    }
    case 'with-length': {
      break;
    }
  }

  const renderResult = renderPcmBufferStereoChunk(
    bitDepth,
    sampleRate,
    startSample,
    endSample - startSample,
    compileResult.fn,
  );

  sendMessage(
    {
      type: 'render-result',
      result: renderResult,
    },
    {
      transfer:
        renderResult.type === 'success' ? [renderResult.buffer.buffer] : [],
    },
  );
};

function sendMessage(
  message: RenderPCMWorkerResponse<BitDepth>,
  options?: WindowPostMessageOptions,
): void {
  self.postMessage(message, options);
}
