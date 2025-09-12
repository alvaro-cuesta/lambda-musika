/**
 * @module
 * Worker-based PCM audio rendering utilities.
 * This splits audio rendering across multiple web workers to avoid blocking the main thread.
 */

import { getRandomId } from '../../utils/random.js';
import { type ExceptionInfo } from '../exception.js';
import { type BitDepth, type BufferForBitDepth } from './PCM.js';
import {
  launchRenderPCMWorker,
  RenderPCMWorkerError,
} from './renderPCMWorker.js';

const DEFAULT_NUM_WORKERS = 4; // Fallback if navigator.hardwareConcurrency is not available

export type RenderWithWorkersResult<Bd extends BitDepth> =
  | {
      type: 'error';
      error: ExceptionInfo;
    }
  | {
      type: 'success';
      buffers: BufferForBitDepth<Bd>[];
    };

// @todo renderPcmBufferMonoWithWorkers

/**
 * Render a stereo PCM audio buffer using WebWorkers for background processing.
 *
 * This will use multiple web workers to render the audio in parallel, improving performance on multi-core systems.
 *
 * @param bitDepth - The bit depth of the audio samples.
 * @param sampleRate - The sample rate of the audio (in Hz)
 * @param length - The length of the audio buffer (in seconds).
 * @param fnCode - The code for a {@link StereoRenderer} function that generates the audio samples.
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export async function renderPcmBufferStereoWithWorkers<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  length: number,
  fnCode: string,
): Promise<RenderWithWorkersResult<Bd>> {
  const channelLength = Math.floor(length * sampleRate);
  const totalSamples = channelLength;

  const numWorkers =
    (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ||
    DEFAULT_NUM_WORKERS;

  const taskId = getRandomId();

  console.debug(`Starting render task ${taskId} with ${numWorkers} workers...`);

  const promises = Array(numWorkers)
    .fill(null)
    .map((_, idx) => {
      const startSample = Math.floor((idx * totalSamples) / numWorkers);
      // Here we have to make sure the last worker does not exceed totalSamples since totalSamples might not divide evenly
      const endSample = Math.min(
        Math.floor(((idx + 1) * totalSamples) / numWorkers),
        totalSamples,
      );

      console.debug(
        `Worker ${idx} processing samples ${startSample} to ${endSample}`,
      );

      return launchRenderPCMWorker(
        taskId,
        idx,
        bitDepth,
        sampleRate,
        startSample,
        endSample,
        fnCode,
      );
    });

  try {
    return {
      type: 'success',
      buffers: await Promise.all(promises),
    };
  } catch (e) {
    if (e instanceof Error) {
      if (e instanceof RenderPCMWorkerError) {
        return {
          type: 'error',
          error: e.error,
        };
      }
    }

    throw e;
  } finally {
    for (const p of promises) {
      p.abort();
    }
  }
}
