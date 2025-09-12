/**
 * @module PCM audio utilities.
 */

import type { Constructor, Tagged } from 'type-fest';
import type { MonoRenderer, StereoRenderer, Time } from '../audio.js';
import { tryParseException, type ExceptionInfo } from '../exception.js';
import { getQuantizerForBitDepth } from './quantizers.js';

export type Uint8 = Tagged<number, 'Uint8'>;

export type Int16 = Tagged<number, 'Int16'>;

export type Float32 = Tagged<number, 'Float32'>;

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export const SUPPORTED_BIT_DEPTHS = [8, 16, 32] as const;

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export type BitDepth = (typeof SUPPORTED_BIT_DEPTHS)[number];

export type BufferForBitDepth<Bd extends BitDepth> = Bd extends 8
  ? Uint8Array<ArrayBuffer>
  : Bd extends 16
    ? Int16Array<ArrayBuffer>
    : Bd extends 32
      ? Float32Array<ArrayBuffer>
      : never;

function getBufferTypeForBitDepth<Bd extends BitDepth>(
  bitDepth: Bd,
): Constructor<BufferForBitDepth<Bd>> {
  switch (bitDepth) {
    case 8:
      return Uint8Array as unknown as Constructor<BufferForBitDepth<Bd>>;
    case 16:
      return Int16Array as unknown as Constructor<BufferForBitDepth<Bd>>;
    case 32:
      return Float32Array as unknown as Constructor<BufferForBitDepth<Bd>>;
    default:
      throw new Error(`Unsupported bit depth: ${bitDepth}`);
  }
}

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
  data: BufferForBitDepth<BitDepth>[],
  numChannels: number,
  sampleRate: number,
  littleEndian = true,
): Blob {
  // @todo Now that this takes an array, data[0] is brittle

  if (data.length === 0) {
    throw new Error('No audio data provided');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- data.length > 0 checked above
  const bytesPerSample = data[0]!.BYTES_PER_ELEMENT;
  const totalSamples = data.reduce((sum, buf) => sum + buf.length, 0);
  const samplesPerChannel = totalSamples / numChannels;

  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samplesPerChannel * blockAlign;

  const header = new ArrayBuffer(44); // Header length
  const dv = new DataView(header);

  const chunkID = littleEndian
    ? 0x52494646 /*                               'RIFF' */
    : 0x52494658; /*                              'RIFX' */

  const audioFormat = data[0] instanceof Float32Array ? 3 : 1; // 1 = PCM, 3 = 32-bit float

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

  return new Blob([header, ...data], { type: 'audio/wav' });
}

export function initRendering<Bd extends BitDepth>(
  bitDepth: Bd,
  length: number,
): {
  buffer: BufferForBitDepth<Bd>;
  quantizer: (v: number) => number;
} {
  const BufferType = getBufferTypeForBitDepth(bitDepth);
  const buffer = new BufferType(length);
  const quantizer = getQuantizerForBitDepth(bitDepth);
  return { buffer, quantizer };
}

export type RenderResult<Bd extends BitDepth> =
  | { type: 'success'; buffer: BufferForBitDepth<Bd> }
  | { type: 'error'; error: ExceptionInfo };

export function renderPcmBufferMonoChunk<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  startSample: number,
  lengthSamples: number,
  fn: MonoRenderer,
): RenderResult<Bd> {
  const { buffer, quantizer } = initRendering(bitDepth, 1 * lengthSamples);

  for (let i = 0; i < lengthSamples; i++) {
    const t = ((startSample + i) / sampleRate) as Time;
    try {
      const y = fn(t);
      buffer[i] = quantizer(y);
    } catch (e) {
      return { type: 'error' as const, error: tryParseException(e) };
    }
  }

  return { type: 'success' as const, buffer };
}

export function renderPcmBufferStereoChunk<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  startSample: number,
  lengthSamples: number,
  fn: StereoRenderer,
): RenderResult<Bd> {
  const { buffer, quantizer } = initRendering(bitDepth, 2 * lengthSamples);

  for (let i = 0; i < lengthSamples; i++) {
    const t = ((startSample + i) / sampleRate) as Time;
    try {
      const [l, r] = fn(t);
      buffer[i * 2 + 0] = quantizer(l);
      buffer[i * 2 + 1] = quantizer(r);
    } catch (e) {
      return { type: 'error' as const, error: tryParseException(e) };
    }
  }

  return { type: 'success' as const, buffer };
}
