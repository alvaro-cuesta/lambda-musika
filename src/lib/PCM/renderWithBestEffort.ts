import { compile } from '../compile';
import type { BitDepth } from './PCM';
import { renderPcmBufferStereoWithOfflineAudioContext } from './renderWithOfflineAudioContext';
import {
  renderPcmBufferStereoWithWorkers,
  type RenderWithWorkersResult,
} from './renderWithWorkers';

/**
 * Render a stereo PCM audio buffer using the best method available.
 *
 * @param bitDepth - The bit depth of the audio samples.
 * @param sampleRate - The sample rate of the audio (in Hz)
 * @param length - The length of the audio buffer (in seconds).
 * @param fn - The {@link StereoRenderer} function that generates the audio samples.
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export async function renderPcmBufferStereoWithBestEffort<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  length: number,
  fnCode: string,
): Promise<RenderWithWorkersResult<Bd>> {
  // Fallback to OfflineAudioContext rendering when workers are not available
  // This fallback used to be a synchronous `renderPcmBufferStereo`, but that blocks the main thread for too long on
  // large renders, while `OfflineAudioContext` is only _slightly_ slower (due to how we have to quantize its output)
  if (typeof Worker === 'undefined') {
    const compileResult = compile(fnCode, sampleRate);
    switch (compileResult.type) {
      case 'error': {
        return { type: 'error', error: compileResult.error };
      }
      case 'infinite': {
        throw new TypeError('Rendering function has infinite length.');
      }
      case 'with-length': {
        break;
      }
    }

    const renderResult = await renderPcmBufferStereoWithOfflineAudioContext(
      bitDepth,
      sampleRate,
      length,
      fnCode,
    );
    switch (renderResult.type) {
      case 'success':
        return { type: 'success', buffers: [renderResult.buffer] };
      case 'error':
        return { type: 'error', error: renderResult.error };
    }
  }

  return renderPcmBufferStereoWithWorkers(bitDepth, sampleRate, length, fnCode);
}
