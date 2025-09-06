/**
 * @module PCM audio utilities.
 */

import type { MonoRenderer, StereoRenderer, Time } from './audio.js';
import { tryParseException, type ExceptionInfo } from './compile.js';
import { quantizeInt16, quantizeUint8 } from './quantizers.js';

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export const SUPPORTED_BIT_DEPTHS = [8, 16, 32] as const;

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export type BitDepth = (typeof SUPPORTED_BIT_DEPTHS)[number];

/**
 * Create a WAV blob from PCM data.
 *
 * @param data - PCM data (Uint8Array or Int16Array)
 * This is laid out as interleaved samples for multiple channels: L0, R0, L1, R1, ... Ln, Rn
 * @param numChannels - Number of audio channels
 * @param sampleRate - Audio sample rate (in Hz)
 * @param littleEndian - Endianness of the audio data
 * @returns A Blob containing the WAV audio data
 */
export function makeWavBlob(
  data:
    | Uint8Array<ArrayBuffer>
    | Int16Array<ArrayBuffer>
    | Float32Array<ArrayBuffer>,
  numChannels: number,
  sampleRate: number,
  littleEndian = true,
): Blob {
  const bytesPerSample = data.BYTES_PER_ELEMENT;
  const samplesPerChannel = data.length / numChannels;

  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samplesPerChannel * blockAlign;

  const header = new ArrayBuffer(44); // Header length
  const dv = new DataView(header);

  const chunkID = littleEndian
    ? 0x52494646 /*                               'RIFF' */
    : 0x52494658; /*                              'RIFX' */

  const audioFormat = data instanceof Float32Array ? 3 : 1; // 3 = float, 1 = PCM

  dv.setUint32(0, chunkID, false); /*             ChunkID */
  dv.setUint32(4, dataSize + 36, true); /*        ChunkSize */
  dv.setUint32(8, 0x57415645, false); /*          Format ('WAVE') */
  dv.setUint32(12, 0x666d7420, false); /*         Subchunk1ID ('fmt ') */
  dv.setUint32(16, 16, true); /*                  Subchunk1Size */
  dv.setUint16(20, audioFormat, true); /*         AudioFormat */
  dv.setUint16(22, numChannels, true); /*         NumChannels */
  dv.setUint32(24, sampleRate, true); /*          SampleRate */
  dv.setUint32(28, byteRate, true); /*            ByteRate */
  dv.setUint16(32, blockAlign, true); /*          BlockAlign */
  dv.setUint16(34, bytesPerSample * 8, true); /*  BitsPerSample */
  dv.setUint32(36, 0x64617461, false); /*         Subchunk2ID ('data') */
  dv.setUint32(40, dataSize, true); /*            Subchunk2Size */

  return new Blob([header, data], { type: 'audio/wav' });
}

type RenderResult<T> =
  | { type: 'success'; buffer: T }
  | { type: 'error'; error: ExceptionInfo };

function renderMonoBuffer<T extends Uint8Array | Int16Array | Float32Array>(
  BufferType: new (length: number) => T,
  quantizer: (value: number) => number,
  sampleRate: number,
  length: number,
  fn: MonoRenderer,
): RenderResult<T> {
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new BufferType(channelLength);

  for (let i = 0; i < buffer.length; i++) {
    const t = (i / sampleRate) as Time;
    try {
      const y = fn(t);
      buffer[i] = quantizer(y);
    } catch (e) {
      return { type: 'error', error: tryParseException(e) } as const;
    }
  }

  return { type: 'success', buffer } as const;
}

function renderStereoBuffer<T extends Uint8Array | Int16Array | Float32Array>(
  BufferType: new (length: number) => T,
  quantizer: (value: number) => number,
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): RenderResult<T> {
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new BufferType(2 * channelLength);

  for (let i = 0; i < channelLength; i++) {
    const t = (i / sampleRate) as Time;
    try {
      const [l, r] = fn(t);
      buffer[i * 2] = quantizer(l);
      buffer[i * 2 + 1] = quantizer(r);
    } catch (e) {
      return { type: 'error', error: tryParseException(e) } as const;
    }
  }

  return { type: 'success', buffer } as const;
}

/**
 * Create a mono audio buffer with 8-bit unsigned integer samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Uint8Mono(
  sampleRate: number,
  length: number,
  fn: MonoRenderer,
): RenderResult<Uint8Array<ArrayBuffer>> {
  return renderMonoBuffer(Uint8Array, quantizeUint8, sampleRate, length, fn);
}

/**
 * Create a stereo audio buffer with 8-bit unsigned integer samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Uint8Stereo(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): RenderResult<Uint8Array<ArrayBuffer>> {
  return renderStereoBuffer(Uint8Array, quantizeUint8, sampleRate, length, fn);
}

/**
 * Create a mono audio buffer with 16-bit signed integer samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Int16Mono(
  sampleRate: number,
  length: number,
  fn: MonoRenderer,
): RenderResult<Int16Array<ArrayBuffer>> {
  return renderMonoBuffer(Int16Array, quantizeInt16, sampleRate, length, fn);
}

/**
 * Create a stereo audio buffer with 16-bit signed integer samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Int16Stereo(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): RenderResult<Int16Array<ArrayBuffer>> {
  return renderStereoBuffer(Int16Array, quantizeInt16, sampleRate, length, fn);
}

/**
 * Create a mono audio buffer with 32-bit floating point samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Float32Mono(
  sampleRate: number,
  length: number,
  fn: MonoRenderer,
): RenderResult<Float32Array<ArrayBuffer>> {
  return renderMonoBuffer(
    Float32Array,
    (v: number) => v,
    sampleRate,
    length,
    fn,
  );
}

/**
 * Create a stereo audio buffer with 32-bit floating point samples.
 *
 * @param sampleRate - Audio sample rate (in Hz)
 * @param length - Duration of the audio buffer (in seconds)
 * @param fn - Function to generate the audio samples
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export function Float32Stereo(
  sampleRate: number,
  length: number,
  fn: StereoRenderer,
): RenderResult<Float32Array<ArrayBuffer>> {
  return renderStereoBuffer(
    Float32Array,
    (v: number) => v,
    sampleRate,
    length,
    fn,
  );
}
