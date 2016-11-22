/* Envelopes */

// Attack function that grows quickly from `[0, 0]` to `[length, 1]` in a concave
// shape.
//
// `curve` controls the exponential strength.
//
//      __
//     /
// ,.·´
export function attack(length, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  return t < length
    ? Math.pow(t/length, curve)
    : 1
}

// Attack function that grows slowly from `[0, 0]` to `[length, 1]` in a convex
// shape.
//
// `curve` controls the exponential strength.
//
//      __
//  ,·´
// /
export function invAttack(length, curve, t) {
  if (typeof t === 'undefined') {
    t = curve
    curve = 2
  }

  return t < length
    ? 1 - Math.pow(1 - t/length, curve)
    : 1
}

// Release function that stays at 1 from `[0, 1]` to [`releaseTime`, 1] and then
// decays quickly from `[releaseTime, 1]` to `[totalTime, 0]` in a concave shape.
//
// `curve` controls the exponential strength.
//
// __
//   \
//    `·.,_
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

// Release function that stays at 1 from `[0, 1]` to [`releaseTime`, 1] and then
// decays slowly from `[releaseTime, 1]` to `[totalTime, 0]` in a convex shape.
//
// `curve` controls the exponential strength.
//
// __
//    `·.
//       \_
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

// Linearly-interpolated envelope, decribed by a set of `[x, y]` points.
// When `x < x0` outputs `y0`. When `x > xn` outputs `yn`.
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
