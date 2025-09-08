/**
 * @module Audio quantization utilities for converting float samples to different bit depths.
 */

import { clamp } from '../../utils/math.js';
import type { MonoSignal } from '../audio.js';
import type { BitDepth, Float32, Int16, Uint8 } from './PCM.js';

type Quantizer = (v: MonoSignal) => number;

/**
 * Quantize a float value to an 8-bit unsigned integer.
 *
 * @param v -1.0 to 1.0
 * @returns {@link Uint8} 0 to 255
 */
function quantizeUint8(v: MonoSignal): Uint8 {
  v = clamp(v, -1, 1);
  return Math.floor(((v + 1) / 2) * 0xff) as Uint8;
}

/**
 * Quantize a float value to a 16-bit signed integer.
 *
 * @param v -1.0 to 1.0
 * @returns {@link Int16} -32768 to 32767
 */
function quantizeInt16(v: MonoSignal): Int16 {
  v = clamp(v, -1, 1);
  return Math.floor(((v + 1) / 2) * 0xffff - 0x8000) as Int16;
}

/**
 * Quantize a float value to a 32-bit float.
 *
 * @param v -1.0 to 1.0
 * @returns {@link Float32} -1.0 to 1.0
 */
function quantizeFloat32(v: MonoSignal): Float32 {
  v = clamp(v, -1, 1);
  return v as Float32;
}

export function getQuantizerForBitDepth(bitDepth: BitDepth): Quantizer {
  switch (bitDepth) {
    case 8:
      return quantizeUint8;
    case 16:
      return quantizeInt16;
    case 32:
      return quantizeFloat32;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- this is a fallthrough
      throw new Error(`Unsupported bit depth: ${bitDepth}`);
  }
}
