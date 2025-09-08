/**
 * @module Audio signal generators.
 */

import type { MonoSignal, Time } from '../audio.js';

/**
 * Generates a stateful sine wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency and time, and returns the sine wave value.
 */
export function Sin() {
  let phase = 0;
  let lastT = 0;

  /**
   * Generates a sine wave signal.
   *
   * @param f - Frequency of the sine wave.
   * @param t - Time in seconds.
   */
  return function sin(f: number, t: Time): MonoSignal {
    phase += 2 * Math.PI * f * (t - lastT);
    phase %= 2 * Math.PI;
    lastT = t;
    return Math.sin(phase);
  };
}

/**
 * Generates a stateful positive saw wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency and time, and returns the positive saw wave value.
 */
export function PositiveSaw() {
  let phase = 0;
  let lastT = 0;

  /**
   * Generates a positive saw wave signal.
   *
   * @param f - Frequency of the saw wave.
   * @param t - Time in seconds.
   */
  return function positiveSaw(f: number, t: Time): MonoSignal {
    phase += ((t - lastT) % (1 / f)) * f;
    phase %= 1;
    lastT = t;
    return phase;
  };
}

/**
 * Generates a stateful saw wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency and time, and returns the saw wave value.
 */
export function Saw() {
  const osc = PositiveSaw();

  /**
   * Generates a saw wave signal.
   *
   * @param f - Frequency of the saw wave.
   * @param t - Time in seconds.
   */
  return function saw(f: number, t: Time): MonoSignal {
    return osc(f, t) * 2 - 1;
  };
}

/**
 * Generates a stateful positive square wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency, pulse width, and time, and returns the positive square wave value.
 */
export function PositiveSquare() {
  const osc = PositiveSaw();

  /**
   * Generates a positive square wave signal.
   *
   * @param f - Frequency of the square wave.
   * @param pw - Pulse width (between 0 and 1). Defaults to 0.5.
   * @param t - Time in seconds.
   */
  function positiveSquare(f: number, t: Time): MonoSignal;
  function positiveSquare(f: number, pw: number, t: Time): MonoSignal;
  function positiveSquare(
    f: number,
    arg3: Time | number,
    arg4?: Time,
  ): MonoSignal {
    let pw: number;
    let t: Time;
    if (typeof arg4 === 'undefined') {
      pw = 0.5;
      t = arg3 as Time;
    } else {
      pw = arg3 as number;
      t = arg4;
    }

    return osc(f, t) > pw ? 1 : 0;
  }

  return positiveSquare;
}

/**
 * Generates a stateful square wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency, pulse width, and time, and returns the square wave value.
 */
export function Square() {
  const osc = PositiveSaw();

  /**
   * Generates a square wave signal.
   *
   * @param f - Frequency of the square wave.
   * @param pw - Pulse width (between 0 and 1). Defaults to 0.5.
   * @param t - Time in seconds.
   */
  function square(f: number, t: Time): MonoSignal;
  function square(f: number, pw: number, t: Time): MonoSignal;
  function square(f: number, arg3: Time | number, arg4?: Time): MonoSignal {
    let pw: number;
    let t: Time;
    if (typeof arg4 === 'undefined') {
      pw = 0.5;
      t = arg3 as Time;
    } else {
      pw = arg3 as number;
      t = arg4;
    }

    return osc(f, t) > pw ? 1 : -1;
  }

  return square;
}

/**
 * Generates a stateful triangle wave signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @returns A function that takes a frequency and time, and returns the triangle wave value.
 */
export function Tri() {
  const osc = PositiveSaw();

  /**
   * Generates a triangle wave signal.
   *
   * @param f - Frequency of the triangle wave.
   * @param t - Time in seconds.
   */
  return function tri(f: number, t: Time): MonoSignal {
    const pos = osc(f, t);
    return (pos <= 0.5 ? pos : 1 - pos) * 4 - 1;
  };
}

/**
 * Generates a stateful low-frequency noise signal.
 *
 * _(State is necessary to keep track of the phase of the wave over time, which is crucial for generating continuous
 * waveforms without clicks or pops.)_
 *
 * @param f - Frequency of the noise.
 * @returns A function that takes time and returns the noise value between 0 and 1.
 * @see {@link LFNoisePolar}
 */
export function LFNoise(f: number) {
  const period = 1 / f;
  let last_update = 0;

  let y0 = Math.random();
  let y1 = Math.random();

  let slope = (y1 - y0) / period;

  /**
   * Generates a low-frequency noise signal between 0 and 1.
   *
   * @param t - Time in seconds.
   * @returns The noise value at the given time.
   */
  return (t: Time): MonoSignal => {
    if (t > last_update + period) {
      y0 = y1;
      y1 = Math.random();
      slope = (y1 - y0) / period;
      last_update += period;
    }

    return y0 + (t - last_update) * slope;
  };
}

/**
 *
 * @param f - Frequency of the noise.
 * @returns A function that takes time and returns the noise value between -1 and 1.
 * @see {@link LFNoise}
 */
export function LFNoise2(f: number) {
  const noise = LFNoise(f);

  /**
   * Generates a low-frequency noise signal between -1 and 1.
   *
   * @param t - Time in seconds.
   * @returns The noise value at the given time.
   */
  return (t: Time): MonoSignal => {
    return noise(t) * 2 - 1;
  };
}

/**
 * Generates a random signal between 0 and 1.
 *
 * @returns A random value between 0 and 1.
 * @see {@link random2}
 */
export function random(): MonoSignal {
  return Math.random();
}

/**
 * Generates a random signal between -1 and 1.
 *
 * @returns A random value between -1 and 1.
 * @see {@link random}
 */
export function random2(): MonoSignal {
  return random() * 2 - 1;
}
