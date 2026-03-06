/**
 * @module Audio quantization utilities for converting float samples to different bit depths.
 */

import { clamp } from '../../utils/math.js';
import type { MonoSignal } from '../audio.js';
import type { BitDepth, Int16, Int32, Uint8 } from './PCM.js';

type Quantizer = (v: MonoSignal) => number;

// @todo Could this be done more efficiently with a LUT?

/**
 * Quantize a float value to an 8-bit unsigned integer.
 *
 * @param v Any float (will be clamped to -1.0 to 1.0)
 * @returns {@link Uint8} 0 to 255
 */
function quantizeUint8(v: MonoSignal): Uint8 {
  v = clamp(v, -1, 1);
  return Math.floor(((v + 1) / 2) * 0xff) as Uint8;
}

/**
 * Quantize a float value to a 16-bit signed integer.
 *
 * @param v Any float (will be clamped to -1.0 to 1.0)
 * @returns {@link Int16} -32768 to 32767
 */
function quantizeInt16(v: MonoSignal): Int16 {
  v = clamp(v, -1, 1);
  return Math.floor(((v + 1) / 2) * 0xffff - 0x8000) as Int16;
}

/**
 * Quantize a float value to a 32-bit signed integer.
 *
 * @param v Any float (will be clamped to -1.0 to 1.0)
 * @returns {@link Int32} -2147483648 to 2147483647
 */
function quantizeInt32(v: MonoSignal): Int32 {
  v = clamp(v, -1, 1);
  return Math.floor(((v + 1) / 2) * 0xffffffff - 0x80000000) as Int32;
}

export function getQuantizerForBitDepth(bitDepth: BitDepth): Quantizer | null {
  switch (bitDepth) {
    case 'uint8':
      return quantizeUint8;
    case 'int16':
      return quantizeInt16;
    case 'int32':
      return quantizeInt32;
    case 'float32':
      return null;
    case 'float64':
      return null;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- this is a fallthrough
      throw new Error(`Unsupported bit depth: ${bitDepth}`);
  }
}
