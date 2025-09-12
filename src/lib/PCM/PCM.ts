/**
 * @module PCM audio utilities.
 */

import type { Tagged } from 'type-fest';

export type Uint8 = Tagged<number, 'Uint8'>;

export type Int16 = Tagged<number, 'Int16'>;

export type Int32 = Tagged<number, 'Int32'>;

export type Float32 = Tagged<number, 'Float32'>;

export type Float64 = Tagged<number, 'Float64'>;

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export const SUPPORTED_BIT_DEPTHS = [
  'uint8',
  'int16',
  'int32',
  'float32',
  'float64',
] as const;

/**
 * Bit depths that are supported by Lambda Musika's PCM utilities.
 */
export type BitDepth = (typeof SUPPORTED_BIT_DEPTHS)[number];

export type BufferForBitDepth<Bd extends BitDepth> = Bd extends 'uint8'
  ? Uint8Array<ArrayBuffer>
  : Bd extends 'int16'
    ? Int16Array<ArrayBuffer>
    : Bd extends 'int32'
      ? Int32Array<ArrayBuffer>
      : Bd extends 'float32'
        ? Float32Array<ArrayBuffer>
        : Bd extends 'float64'
          ? Float64Array<ArrayBuffer>
          : never;

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

  const audioFormat =
    data[0] instanceof Float32Array || data[0] instanceof Float64Array
      ? 3 // IEEE float, little-endian only
      : 1; // PCM, 8-bit always unsigned, ≥16-bit signed little-endian

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
