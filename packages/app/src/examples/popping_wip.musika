const { Generator, Envelope, Filter, Operator, Music, Util } = Musika

const triggerSweep = Generator.Sin()

let from = 0, length = 0, pan = 0.5

return t => {
  let out = 0

  const dt = Math.random() * (triggerSweep(0.1, t) + 1.0) / 2 * 0.1

  const to = from + length

  if (t < from || t > to) {
    from = t + dt
    length = Math.random() * 0.1
    pan = 0.25 + Math.random() * 0.5
  } else if (t > from) {
    out = Math.random() * 0.5
  }

  out *= Envelope.attack(length, 2, t)
       * Envelope.release(length, to, 2.9, t)

  return [
    out * (1 - pan),
    out * pan,
  ]
}
