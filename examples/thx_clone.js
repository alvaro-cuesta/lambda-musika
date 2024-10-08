const { Generator, Envelope, Filter, Operator, Music, Util } = Musika

const LENGTH = 15
const NUM_VOICES = 20
const BASE_SEMITONE = 14.5 + Music.LOWEST_SEMITONE_DIFF_FROM_BASE
const ATTACK_LENGTH = 3
const ATTACK_STRENGTH = 2
const RELEASE_LENGTH = 3
const RELEASE_STRENGTH = 2

setLength(LENGTH)

const Voice = () => ({
  osc: Generator.Saw(),
  f: 200 + Math.random() * 200,
  f_noise: Generator.LFNoise1(0.5),
  target_f_noise: Generator.LFNoise1(0.1),
  pan: (Math.random() + 0.5) / 2,
  x1: 5.5 + Math.random() * 0.5,
  x2: 8.5 + Math.random() * 0.5,
  y1: 0.1 + Math.random() * 0.1,
})

const voices = Array(NUM_VOICES).fill()
  .map(() => Voice())
  .sort(({ f }) => f)
  .map((voice, i) => {
    const semitone = Math.floor(i / (NUM_VOICES/6)) * 12 + BASE_SEMITONE
    return {
      ...voice,
      i,
      target_f: Music.semitoneToFrequency(semitone),
    }
  })

// Faster than using Envelope.linear
const sweep_envelope = (x1, x2, y1, t) =>
  t < x1
    ? y1 * t/x1
  : t < x2
    ? y1 + (t - x1) * (1 - y1) / (x2 - x1)
  : 1

return t => {
  let lout = 0
  let rout = 0

  for (const voice of voices) {
    const { i, osc, f, f_noise, target_f, target_f_noise, pan, x1, x2, y1 } = voice

    const s = sweep_envelope(x1, x2, y1, t)

    const new_f = f + f_noise(t) * 3 * (i + 1)
    const new_target_f = target_f + target_f_noise(t) * i/4
    const v = osc(Operator.mix(new_target_f, new_f, s), t)

    lout += v * (1 - pan)
    rout += v * pan
  }

  const amp = Envelope.attack(ATTACK_LENGTH, ATTACK_STRENGTH, t)
    * Envelope.release(RELEASE_LENGTH, LENGTH, RELEASE_STRENGTH, t)
    / NUM_VOICES

  return [
    lout * amp,
    rout * amp,
  ]
}
