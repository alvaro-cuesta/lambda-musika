/* Generators */

export function Sin() {
  let phase = 0
  let lastT = 0

  return function sin(f, t) {
    phase += 2 * Math.PI * f * (t - lastT)
    phase %= 2 * Math.PI
    lastT = t
    return Math.sin(phase)
  }
}

export function PositiveSaw() {
  let phase = 0
  let lastT = 0

  return function positiveSaw(f, t) {
    phase += ((t - lastT) % (1/f)) * f
    phase %= 1
    lastT = t
    return phase * 2 - 1
  }
}

export function Saw() {
  const osc = PositiveSaw()

  return function saw(f, t) {
    return osc(f, t) * 2 - 1
  }
}

export function PositiveSquare() {
  const osc = PositiveSaw()

  return function positiveSquare(f, pw, t) {
    if (typeof t === 'undefined') {
      t = pw
      pw = 0.5
    }

    return (osc(f, t) > pw) ? 1 : 0
  }
}

export function Square() {
  const osc = PositiveSaw()

  return function square(f, pw, t) {
    if (typeof t === 'undefined') {
      t = pw
      pw = 0.5
    }

    return (osc(f, t) > pw) ? 1 : -1
  }
}

export function Tri() {
  const osc = PositiveSaw()

  return function tri(f, t) {
    let pos = osc(f, t)

    return (pos <= 0.5 ? pos : (1 - pos)) * 4 - 1
  }
}

export function LFNoise1(f) {
  let period = 1/f
  let last_update = 0

  let y0 = Math.random()
  let y1 = Math.random()

  let slope = (y1 - y0) / period

  return t => {
    if (t > (last_update + period)) {
      y0 = y1
      y1 = Math.random()
      slope = (y1 - y0) / period
      last_update += period
    }

    return y0 + (t - last_update) * slope
  }
}

import * as myself from './Generator.js'
export default myself
