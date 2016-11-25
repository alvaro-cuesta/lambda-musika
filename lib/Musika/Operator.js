/* Operators */

export function mix(s1, s2, a = 0.5) {
  return s1 * a + s2 * (1 - a)
}

export function mixN() {
  let sum = 0
  for (var i = 0; i < arguments.length; i++) {
    sum += arguments[i]
  }
  return sum/arguments.length
}

export function panner(signal, position) {
  position = position/2 + 0.5

  return [signal * (1 - position), signal * position]
}
