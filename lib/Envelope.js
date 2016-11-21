/* Envelopes */

export function attack(length, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  return t < length
    ? Math.pow(t/length, curve)
    : 1
}

export function invAttack(length, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  return t < length
    ? 1 - Math.pow(1 - t/length, curve)
    : 1
}

export function release(releaseTime, totalTime, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  if (t > totalTime) return 0
  let releaseStart = totalTime - releaseTime
  if (t <= releaseStart) return 1

  return Math.pow((releaseTime - (t - releaseStart))/releaseTime, curve)
}

export function invRelease(releaseTime, totalTime, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  if (t > totalTime) return 0
  let releaseStart = totalTime - releaseTime
  if (t <= releaseStart) return 1

  return 1 - Math.pow((t - releaseStart)/releaseTime, curve)
}

export function linear(points, t) {
  for (let i = 0; i < points.length; i++) {
    let [x1, y1] = points[i]

    if (t < x1) {
      if (i === 0) { return y1 }

      let [x0, y0] = points[i - 1]
      return y0 + (y1 - y0) * (t - x0) / (x1 - x0)
    }
  }

  return points[points.length - 1][1];
}

import * as myself from './Envelope.js'
export default myself
