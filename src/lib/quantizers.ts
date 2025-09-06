/**
 * @module quantizers
 * Audio quantization utilities for converting float samples to different bit depths.
 */

/**
 * Quantize a float value to an 8-bit unsigned integer.
 * @param v - Float value in range [-1, 1]
 * @returns 0 to 255
 */
export function quantizeUint8(v: number): number {
  return Math.floor(((v + 1) / 2) * 0xff);
}

/**
 * Quantize a float value to a 16-bit signed integer.
 * @param v - Float value in range [-1, 1]
 * @returns -32768 to 32767
 */
export function quantizeInt16(v: number): number {
  return Math.floor(((v + 1) / 2) * 0xffff - 0x8000);
}