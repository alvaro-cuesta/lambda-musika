const {Generator, Envelope, Operator, Music, Util} = Musika

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

let voices = [];
for (var i = 0; i < NUM_VOICES; i++) {
  voices.push(Voice())
}

voices.sort(({f}) => f)

for (var i = 0; i < NUM_VOICES; i++) {
  let semitone = Math.floor(i / (NUM_VOICES/6)) * 12 + BASE_SEMITONE
  voices[i].target_f = Music.semitoneToFrequency(semitone)
}

function sweep_envelope(x1, x2, y1, t) {
  // y = y0 + (x - x0) * (y1 - y0) / (x1 - x0)
  if (t < x1) {
    return y1 * t/x1
  } else if (t < x2) {
    return y1 + (t - x1) * (1 - y1) / (x2 - x1)
  } else {
    return 1
  }
}

return t => {
  let lout = 0
  let rout = 0

  for (var i = 0; i < NUM_VOICES; i++) {
    let {osc, f, f_noise, target_f, target_f_noise, pan, x1, x2, y1} = voices[i]

    f = f + f_noise(t) * 3 * (i + 1)
    target_f = target_f + target_f_noise(t) * i/4

    let s = sweep_envelope(x1, x2, y1, t)
    let v = osc(Operator.mix(target_f, f, s), t)
    lout += v * (1 - pan)
    rout += v * pan
  }

  let amp = Envelope.attack(ATTACK_LENGTH, ATTACK_STRENGTH, t)
    * Envelope.release(RELEASE_LENGTH, LENGTH, RELEASE_STRENGTH, t)
    / NUM_VOICES

  return [lout * amp, rout * amp]
}
