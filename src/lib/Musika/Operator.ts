/**
 * @module Audio signal operators.
 */

import type { MonoSignal, StereoSignal } from '../audio.js';

/**
 * Mixes two mono signals together.
 *
 * @param s1 The first mono signal.
 * @param s2 The second mono signal.
 * @param a The mix ratio (0 to 1).
 * @returns The mixed mono signal.
 */
export function mix(s1: MonoSignal, s2: MonoSignal, a = 0.5): MonoSignal {
  return s1 * a + s2 * (1 - a);
}

/**
 * Mixes multiple mono signals into a single mono signal.
 *
 * @param signals The mono signals to be mixed.
 * @returns The mixed mono signal.
 */
export function mixN(...signals: MonoSignal[]): MonoSignal {
  if (signals.length === 0) return 0;

  const sum = signals.reduce((a, b) => a + b, 0);
  return sum / signals.length;
}

/**
 * Pans a mono signal into a stereo signal based on the given position.
 *
 * @param signal The mono signal to be panned.
 * @param position The position to pan the signal, ranging from -1 (left) to 1 (right).
 * @returns The panned stereo signal.
 */
export function panner(signal: MonoSignal, position: number): StereoSignal {
  position = position / 2 + 0.5;
  return [signal * (1 - position), signal * position];
}
