import type { MonoSignal } from '../../audio.js';

export type BiquadCoefficients = [number, number, number, number, number];

export const Biquad = Object.assign(
  /**
   * Create a biquad filter.
   *
   * _(This filter maintains internal state across calls, allowing it to process audio signals over time.)_
   *
   * @returns A function that applies the biquad filter (given a set of coefficients) to an input signal.
   */
  function Biquad() {
    let z1 = 0;
    let z2 = 0;

    return (coeff: BiquadCoefficients, input: MonoSignal) => {
      const [a0, a1, a2, b1, b2] = coeff;
      const output = input * a0 + z1;
      z1 = input * a1 + z2 - b1 * output;
      z2 = input * a2 - b2 * output;

      return output;
    };
  },
  {
    /**
     * Create low-pass filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param Q - The quality factor.
     * @returns The filter coefficients.
     */
    LP: function biquadLP(cutoff: number, Q: number): BiquadCoefficients {
      const K = Math.tan(Math.PI * cutoff);
      const norm = 1 / (1 + K / Q + K * K);
      const a0 = K * K * norm;
      const a1 = 2 * a0;
      const a2 = a0;
      const b1 = 2 * (K * K - 1) * norm;
      const b2 = (1 - K / Q + K * K) * norm;
      return [a0, a1, a2, b1, b2];
    },

    /**
     * Create high-pass filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param Q - The quality factor.
     * @returns The filter coefficients.
     */
    HP: function biquadHP(cutoff: number, Q: number): BiquadCoefficients {
      const K = Math.tan(Math.PI * cutoff);
      const norm = 1 / (1 + K / Q + K * K);
      const a0 = 1 * norm;
      const a1 = -2 * a0;
      const a2 = a0;
      const b1 = 2 * (K * K - 1) * norm;
      const b2 = (1 - K / Q + K * K) * norm;
      return [a0, a1, a2, b1, b2];
    },

    /**
     * Create band-pass filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param Q - The quality factor.
     * @returns The filter coefficients.
     */
    BP: function biquadBP(cutoff: number, Q: number): BiquadCoefficients {
      const K = Math.tan(Math.PI * cutoff);
      const norm = 1 / (1 + K / Q + K * K);
      const a0 = (K / Q) * norm;
      const a1 = 0;
      const a2 = -a0;
      const b1 = 2 * (K * K - 1) * norm;
      const b2 = (1 - K / Q + K * K) * norm;
      return [a0, a1, a2, b1, b2];
    },

    /**
     * Create notch filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param Q - The quality factor.
     * @returns The filter coefficients.
     */
    Notch: function biquadNotch(cutoff: number, Q: number): BiquadCoefficients {
      const K = Math.tan(Math.PI * cutoff);
      const norm = 1 / (1 + K / Q + K * K);
      const a0 = (1 + K * K) * norm;
      const a1 = 2 * (K * K - 1) * norm;
      const a2 = a0;
      const b1 = a1;
      const b2 = (1 - K / Q + K * K) * norm;
      return [a0, a1, a2, b1, b2];
    },

    /**
     * Create peak filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param Q - The quality factor.
     * @param peakGain - The peak gain in dB.
     * @returns The filter coefficients.
     */
    Peak: function biquadPeak(
      cutoff: number,
      Q: number,
      peakGain: number,
    ): BiquadCoefficients {
      const V = Math.pow(10, Math.abs(peakGain) / 20);
      const K = Math.tan(Math.PI * cutoff);

      // boost
      if (peakGain >= 0) {
        const norm = 1 / (1 + (1 / Q) * K + K * K);
        const a0 = (1 + (V / Q) * K + K * K) * norm;
        const a1 = 2 * (K * K - 1) * norm;
        const a2 = (1 - (V / Q) * K + K * K) * norm;
        const b1 = a1;
        const b2 = (1 - (1 / Q) * K + K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
      // cut
      else {
        const norm = 1 / (1 + (V / Q) * K + K * K);
        const a0 = (1 + (1 / Q) * K + K * K) * norm;
        const a1 = 2 * (K * K - 1) * norm;
        const a2 = (1 - (1 / Q) * K + K * K) * norm;
        const b1 = a1;
        const b2 = (1 - (V / Q) * K + K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
    },

    /**
     * Create low-shelf filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param peakGain - The peak gain in dB. >= 0 is boost, < 0 is cut.
     * @returns The filter coefficients.
     */
    LowShelf: function biquadLowShelf(
      cutoff: number,
      peakGain: number,
    ): BiquadCoefficients {
      const V = Math.pow(10, Math.abs(peakGain) / 20);
      const K = Math.tan(Math.PI * cutoff);

      // boost
      if (peakGain >= 0) {
        const norm = 1 / (1 + Math.SQRT2 * K + K * K);
        const a0 = (1 + Math.sqrt(2 * V) * K + V * K * K) * norm;
        const a1 = 2 * (V * K * K - 1) * norm;
        const a2 = (1 - Math.sqrt(2 * V) * K + V * K * K) * norm;
        const b1 = 2 * (K * K - 1) * norm;
        const b2 = (1 - Math.SQRT2 * K + K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
      // cut
      else {
        const norm = 1 / (1 + Math.sqrt(2 * V) * K + V * K * K);
        const a0 = (1 + Math.SQRT2 * K + K * K) * norm;
        const a1 = 2 * (K * K - 1) * norm;
        const a2 = (1 - Math.SQRT2 * K + K * K) * norm;
        const b1 = 2 * (V * K * K - 1) * norm;
        const b2 = (1 - Math.sqrt(2 * V) * K + V * K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
    },

    /**
     * Create high-shelf filter coefficients for {@link Biquad}.
     *
     * @param cutoff - The cutoff frequency.
     * @param peakGain - The peak gain in dB. >= 0 is boost, < 0 is cut.
     * @returns The filter coefficients.
     */
    HighShelf: function biquadHighShelf(
      cutoff: number,
      peakGain: number,
    ): BiquadCoefficients {
      const V = Math.pow(10, Math.abs(peakGain) / 20);
      const K = Math.tan(Math.PI * cutoff);

      // boost
      if (peakGain >= 0) {
        const norm = 1 / (1 + Math.SQRT2 * K + K * K);
        const a0 = (V + Math.sqrt(2 * V) * K + K * K) * norm;
        const a1 = 2 * (K * K - V) * norm;
        const a2 = (V - Math.sqrt(2 * V) * K + K * K) * norm;
        const b1 = 2 * (K * K - 1) * norm;
        const b2 = (1 - Math.SQRT2 * K + K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
      // cut
      else {
        const norm = 1 / (V + Math.sqrt(2 * V) * K + K * K);
        const a0 = (1 + Math.SQRT2 * K + K * K) * norm;
        const a1 = 2 * (K * K - 1) * norm;
        const a2 = (1 - Math.SQRT2 * K + K * K) * norm;
        const b1 = 2 * (K * K - V) * norm;
        const b2 = (V - Math.sqrt(2 * V) * K + K * K) * norm;
        return [a0, a1, a2, b1, b2];
      }
    },
  },
);
