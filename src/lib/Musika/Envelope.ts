/**
 * @module Envelope functions.
 */

import type { Time } from '../audio';

/**
 * Attack function that grows quickly from `[0, 0]` to `[length, 1]` in a concave
 * shape.
 *
 * `curve` controls the exponential strength.
 *
 * ```
 *      __
 *     /
 * ,.·´
 * ```
 *
 * @param length - The length of the attack phase.
 * @param curve - The curve of the attack (higher values = more aggressive). Defaults to 2.
 * @param t - The current time.
 * @return The envelope value at time `t`.
 */
export function attack(length: number, t: Time): number;
export function attack(length: number, curve: number, t: Time): number;
export function attack(
  length: number,
  arg3: Time | number,
  arg4?: Time,
): number {
  let curve: number;
  let t: Time;
  if (typeof arg4 === 'undefined') {
    curve = 2;
    t = arg3 as Time;
  } else {
    curve = arg3 as number;
    t = arg4;
  }

  return t < length ? Math.pow(t / length, curve) : 1;
}

/**
 * Attack function that grows slowly from `[0, 0]` to `[length, 1]` in a convex
 * shape.
 *
 * `curve` controls the exponential strength.
 *
 * ```
 *      __
 *  ,·´
 * /
 * ```
 *
 * @param length - The length of the attack phase.
 * @param curve - The curve of the attack (higher values = slower). Defaults to 2.
 * @param t - The current time.
 * @return The envelope value at time `t`.
 */
export function invAttack(length: number, t: Time): number;
export function invAttack(length: number, curve: number, t: Time): number;
export function invAttack(
  length: number,
  arg3: Time | number,
  arg4?: Time,
): number {
  let curve: number;
  let t: Time;
  if (typeof arg4 === 'undefined') {
    curve = 2;
    t = arg3 as Time;
  } else {
    curve = arg3 as number;
    t = arg4;
  }

  return t < length ? 1 - Math.pow(1 - t / length, curve) : 1;
}

/**
 * Release function that stays at 1 from `[0, 1]` to [`releaseTime`, 1]` and then
 * decays quickly from `[releaseTime, 1]` to `[totalTime, 0]` in a concave shape.
 *
 * `curve` controls the exponential strength.
 *
 * ```
 * __
 *   \
 *    `·.,_
 * ```
 *
 * @param releaseTime - The length of the release phase.
 * @param totalTime - The total duration.
 * @param curve - The curve of the release (higher values = more aggressive). Defaults to 2.
 * @param t - The current time.
 * @return The envelope value at time `t`.
 */
export function release(
  releaseTime: number,
  totalTime: number,
  t: Time,
): number;
export function release(
  releaseTime: number,
  totalTime: number,
  curve: number,
  t: Time,
): number;
export function release(
  releaseTime: number,
  totalTime: number,
  arg3: Time | number,
  arg4?: Time,
): number {
  let curve: number;
  let t: Time;
  if (typeof arg4 === 'undefined') {
    curve = 2;
    t = arg3 as Time;
  } else {
    curve = arg3 as number;
    t = arg4;
  }

  if (t > totalTime) return 0;
  const releaseStart = totalTime - releaseTime;
  if (t <= releaseStart) return 1;

  return Math.pow((releaseTime - (t - releaseStart)) / releaseTime, curve);
}

/**
 * Release function that stays at 1 from `[0, 1]` to [`releaseTime`, 1] and then
 * decays slowly from `[releaseTime, 1]` to `[totalTime, 0]` in a convex shape.
 *
 * `curve` controls the exponential strength.
 *
 * ```
 * __
 *    `·.
 *       \_
 * ```
 *
 * @param releaseTime - The length of the release phase.
 * @param totalTime - The total duration.
 * @param curve - The curve of the release (higher values = slower). Defaults to 2.
 * @param t - The current time.
 * @return The envelope value at time `t`.
 */
export function invRelease(
  releaseTime: number,
  totalTime: number,
  t: Time,
): number;
export function invRelease(
  releaseTime: number,
  totalTime: number,
  curve: number,
  t: Time,
): number;
export function invRelease(
  releaseTime: number,
  totalTime: number,
  arg3: Time | number,
  arg4?: Time,
): number {
  let curve: number;
  let t: Time;
  if (typeof arg4 === 'undefined') {
    curve = 2;
    t = arg3 as Time;
  } else {
    curve = arg3 as number;
    t = arg4;
  }

  if (t > totalTime) return 0;
  const releaseStart = totalTime - releaseTime;
  if (t <= releaseStart) return 1;

  return 1 - Math.pow((t - releaseStart) / releaseTime, curve);
}

/**
 * Linearly-interpolated envelope, described by a set of `[x, y]` points.
 *
 * When `t < x0` outputs `y0`. When `t > xn` outputs `yn`.
 *
 * ```
 *    /\
 *   /  \       _____
 *  /    \_____/     \
 * /                  \
 * ```
 *
 * @param points - Array of `[x, y]` points describing the envelope.
 * @param t - The current time.
 * @return The envelope value at time `t`.
 */
export function linear(points: [number, number][], t: number): number {
  if (points.length < 2) return 0;

  for (let i = 0; i < points.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe because we check i < points.length
    const [x1, y1] = points[i]!;

    if (t < x1) {
      if (i === 0) {
        return y1;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe because i > 0
      const [x0, y0] = points[i - 1]!;
      return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe because we check points.length >= 2
  return points.at(-1)![1];
}
