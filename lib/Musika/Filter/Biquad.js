export default function Biquad() {
  let z1 = 0
  let z2 = 0

  return ([a0, a1, a2, b1, b2], input) => {
    let output = input * a0 + z1
    z1 = input * a1 + z2 - b1 * output
    z2 = input * a2 - b2 * output

    return output
  }
}

Biquad.LP = function biquadLP(cutoff, Q) {
  let K = Math.tan(Math.PI * cutoff)

  let norm = 1 / (1 + K / Q + K * K)
  let a0 = K * K * norm
  let a1 = 2 * a0
  let a2 = a0
  let b1 = 2 * (K * K - 1) * norm
  let b2 = (1 - K / Q + K * K) * norm

  return [a0, a1, a2, b1, b2]
}

Biquad.HP = function biquadHP(cutoff, Q) {
  let K = Math.tan(Math.PI * cutoff)

  let norm = 1 / (1 + K / Q + K * K)
  let a0 = 1 * norm
  let a1 = -2 * a0
  let a2 = a0
  let b1 = 2 * (K * K - 1) * norm
  let b2 = (1 - K / Q + K * K) * norm

  return [a0, a1, a2, b1, b2]
}

Biquad.BP = function biquadBP(cutoff, Q) {
  let K = Math.tan(Math.PI * cutoff)

  let norm = 1 / (1 + K / Q + K * K)
  let a0 = K / Q * norm
  let a1 = 0
  let a2 = -a0
  let b1 = 2 * (K * K - 1) * norm
  let b2 = (1 - K / Q + K * K) * norm

  return [a0, a1, a2, b1, b2]
}

Biquad.Notch = function biquadNotch(cutoff, Q) {
  let K = Math.tan(Math.PI * cutoff)

  let norm = 1 / (1 + K / Q + K * K)
  let a0 = (1 + K * K) * norm
  let a1 = 2 * (K * K - 1) * norm
  let a2 = a0
  let b1 = a1
  let b2 = (1 - K / Q + K * K) * norm

  return [a0, a1, a2, b1, b2]
}

Biquad.Peak = function biquadPeak(cutoff, Q, peakGain) {
  let V = Math.pow(10, Math.abs(peakGain) / 20)
  let K = Math.tan(Math.PI * cutoff)

  if (peakGain >= 0) {  // boost
      let norm = 1 / (1 + 1/Q * K + K * K)
      let a0 = (1 + V/Q * K + K * K) * norm
      let a1 = 2 * (K * K - 1) * norm
      let a2 = (1 - V/Q * K + K * K) * norm
      let b1 = a1
      let b2 = (1 - 1/Q * K + K * K) * norm

      return [a0, a1, a2, b1, b2]
  } else {  // cut
      let norm = 1 / (1 + V/Q * K + K * K)
      let a0 = (1 + 1/Q * K + K * K) * norm
      let a1 = 2 * (K * K - 1) * norm
      let a2 = (1 - 1/Q * K + K * K) * norm
      let b1 = a1
      let b2 = (1 - V/Q * K + K * K) * norm

      return [a0, a1, a2, b1, b2]
  }
}

Biquad.LowShelf = function biquadLowShelf(cutoff, peakGain) {
  let V = Math.pow(10, Math.abs(peakGain) / 20)
  let K = Math.tan(Math.PI * cutoff)

  if (peakGain >= 0) {  // boost
      let norm = 1 / (1 + Math.SQRT2 * K + K * K)
      let a0 = (1 + Math.sqrt(2*V) * K + V * K * K) * norm
      let a1 = 2 * (V * K * K - 1) * norm
      let a2 = (1 - Math.sqrt(2*V) * K + V * K * K) * norm
      let b1 = 2 * (K * K - 1) * norm
      let b2 = (1 - Math.SQRT2 * K + K * K) * norm

      return [a0, a1, a2, b1, b2]
  } else {  // cut
      let norm = 1 / (1 + Math.sqrt(2*V) * K + V * K * K)
      let a0 = (1 + Math.SQRT2 * K + K * K) * norm
      let a1 = 2 * (K * K - 1) * norm
      let a2 = (1 - Math.SQRT2 * K + K * K) * norm
      let b1 = 2 * (V * K * K - 1) * norm
      let b2 = (1 - Math.sqrt(2*V) * K + V * K * K) * norm

      return [a0, a1, a2, b1, b2]
  }
}

Biquad.HighShelf = function biquadHighShelf(cutoff, peakGain) {
  let V = Math.pow(10, Math.abs(peakGain) / 20)
  let K = Math.tan(Math.PI * cutoff)

  if (peakGain >= 0) {  // boost
      let norm = 1 / (1 + Math.SQRT2 * K + K * K)
      let a0 = (V + Math.sqrt(2*V) * K + K * K) * norm
      let a1 = 2 * (K * K - V) * norm
      let a2 = (V - Math.sqrt(2*V) * K + K * K) * norm
      let b1 = 2 * (K * K - 1) * norm
      let b2 = (1 - Math.SQRT2 * K + K * K) * norm

      return [a0, a1, a2, b1, b2]
  } else {  // cut
      let norm = 1 / (V + Math.sqrt(2*V) * K + K * K)
      let a0 = (1 + Math.SQRT2 * K + K * K) * norm
      let a1 = 2 * (K * K - 1) * norm
      let a2 = (1 - Math.SQRT2 * K + K * K) * norm
      let b1 = 2 * (K * K - V) * norm
      let b2 = (V - Math.sqrt(2*V) * K + K * K) * norm

      return [a0, a1, a2, b1, b2]
  }
}
