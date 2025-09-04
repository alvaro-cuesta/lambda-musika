/**
 * @module PCM audio utilities.
 */

import type { MonoRenderer, StereoRenderer } from './audio.js';
import { tryParseException, type ExceptionInfo } from './compile.js';

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
  data: Uint8Array<ArrayBuffer> | Int16Array<ArrayBuffer>,
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

  dv.setUint32(0, chunkID, false); /*             ChunkID */
  dv.setUint32(4, dataSize + 36, true); /*        ChunkSize */
  dv.setUint32(8, 0x57415645, false); /*          Format ('WAVE') */
  dv.setUint32(12, 0x666d7420, false); /*         Subchunk1ID ('fmt ') */
  dv.setUint32(16, 16, true); /*                  Subchunk1Size */
  dv.setUint16(20, 1, true); /*                   AudioFormat (1 = PCM) */
  dv.setUint16(22, numChannels, true); /*         NumChannels */
  dv.setUint32(24, sampleRate, true); /*          SampleRate */
  dv.setUint32(28, byteRate, true); /*            ByteRate */
  dv.setUint16(32, blockAlign, true); /*          BlockAlign */
  dv.setUint16(34, bytesPerSample * 8, true); /*  BitsPerSample */
  dv.setUint32(36, 0x64617461, false); /*         Subchunk2ID ('data') */
  dv.setUint32(40, dataSize, true); /*            Subchunk2Size */

  return new Blob([header, data], { type: 'audio/wav' });
}

/**
 * Quantize a float value to an 8-bit unsigned integer.
 *
 * @param v -1.0 to 1.0
 * @returns 0 to 255
 */
function quantizeUint8(v: number) {
  return Math.floor(((v + 1) / 2) * 0xff);
}

/**
 * Quantize a float value to a 16-bit signed integer.
 *
 * @param v -1.0 to 1.0
 * @returns -32768 to 32767
 */
export function quantizeInt16(v: number) {
  return Math.floor(((v + 1) / 2) * 0xffff - 0x8000);
}

type RenderResult<T> =
  | { type: 'success'; buffer: T }
  | { type: 'error'; error: ExceptionInfo };

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
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new Uint8Array(channelLength);

  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    let y;
    try {
      y = fn(t);
    } catch (e) {
      return { type: 'error', error: tryParseException(e) } as const;
    }
    buffer[i] = quantizeUint8(y);
  }

  return { type: 'success', buffer } as const;
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
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new Uint8Array(2 * channelLength);

  for (let i = 0; i < channelLength; i++) {
    const t = i / sampleRate;
    let l, r;
    try {
      [l, r] = fn(t);
    } catch (e) {
      return { type: 'error' as const, error: tryParseException(e) };
    }
    buffer[i * 2] = quantizeUint8(l);
    buffer[i * 2 + 1] = quantizeUint8(r);
  }

  return { type: 'success' as const, buffer };
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
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new Int16Array(channelLength);

  for (let i = 0; i < channelLength; i++) {
    const t = i / sampleRate;
    let y;
    try {
      y = fn(t);
    } catch (e) {
      return { type: 'error' as const, error: tryParseException(e) };
    }
    buffer[i] = quantizeInt16(y);
  }

  return { type: 'success' as const, buffer };
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
  const channelLength = Math.floor(length * sampleRate);
  const buffer = new Int16Array(2 * channelLength);

  for (let i = 0; i < channelLength; i++) {
    const t = i / sampleRate;
    let l, r;
    try {
      [l, r] = fn(t);
    } catch (e) {
      return { type: 'error' as const, error: tryParseException(e) };
    }
    buffer[i * 2] = quantizeInt16(l);
    buffer[i * 2 + 1] = quantizeInt16(r);
  }

  return { type: 'success' as const, buffer };
}
