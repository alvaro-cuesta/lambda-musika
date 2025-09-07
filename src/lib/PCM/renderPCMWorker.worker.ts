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
      self.postMessage({
        type: 'compile-error',
        error: compileResult.error,
      } satisfies RenderPCMWorkerResponse<typeof bitDepth>);
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

  self.postMessage(
    {
      type: 'render-result',
      result: renderResult,
    } satisfies RenderPCMWorkerResponse<typeof bitDepth>,
    {
      transfer:
        renderResult.type === 'success' ? [renderResult.buffer.buffer] : [],
    },
  );
};
