import type { MonoRenderer, StereoRenderer } from '../audio';
import {
  renderPcmBufferMonoChunk,
  renderPcmBufferStereoChunk,
  type BitDepth,
  type RenderResult,
} from './PCM';

/**
 * Render a mono PCM audio buffer in the main thread.
 *
 * This method is blocking. Prefer using {@link renderPcmBufferMonoWithWorkers} or
 * {@link renderPcmBufferMonoWithOfflineAudioContext} for non-blocking rendering.
 *
 * @param bitDepth - The bit depth of the audio samples.
 * @param sampleRate - The sample rate of the audio (in Hz)
 * @param length - The length of the audio buffer (in seconds).
 * @param fn - The {@link MonoRenderer} function that generates the audio samples.
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function renderPcmBufferMonoWithMainThread<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  length: number,
  fn: MonoRenderer,
): RenderResult<Bd> {
  const channelLength = Math.floor(length * sampleRate);
  return renderPcmBufferMonoChunk(bitDepth, sampleRate, 0, channelLength, fn);
}

/**
 * Render a stereo PCM audio buffer in the main thread.
 *
 * This method is blocking. Prefer using {@link renderPcmBufferStereoWithWorkers} or
 * {@link renderPcmBufferStereoWithOfflineAudioContext} for non-blocking rendering.
 *
 * @param bitDepth - The bit depth of the audio samples.
 * @param sampleRate - The sample rate of the audio (in Hz)
 * @param length - The length of the audio buffer (in seconds).
 * @param fn - The {@link StereoRenderer} function that generates the audio samples.
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function renderPcmBufferStereoWithMainThread<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): RenderResult<Bd> {
  const channelLength = Math.floor(length * sampleRate);
  return renderPcmBufferStereoChunk(bitDepth, sampleRate, 0, channelLength, fn);
}
