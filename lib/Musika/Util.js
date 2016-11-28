/* Utilities */

export function curry(uncurried) {
  let args = Array.prototype.slice.call(arguments, 1)

  return function() {
    return uncurried.apply(
      this,
      args.concat(Array.prototype.slice.call(arguments, 0))
    )
  }
}

export function choose(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function LimitRate(f) {
  let period = 1/f
  let next_update = period
  let last_v

  return function(fn) {
    let t = arguments[arguments.length - 1]

    if (t > next_update) {
      last_v = fn.apply(this, Array.from(arguments).slice(1))
      next_update = next_update + period
    }

    return last_v
  }
}
