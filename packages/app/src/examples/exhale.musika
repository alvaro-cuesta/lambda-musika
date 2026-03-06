const { Generator, Filter, Envelope, Music, Util } = Musika

const TEMPO = Music.Tempo(2, 4, 90)
const A = 7
const Q = 15
const PASSES = 3
const NOTES = [
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['A4', 'C5', 'E5'],
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['A4', 'C5', 'E#5', 'A4', 'C5', 'E#5'],
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['A4', 'C5'],
  ['E#5', 'C5', 'A4', 'E#5', 'C5', 'A4',],
  ['C5', 'A4'],
  ['C5', 'A4'],
  ['C5', 'A4'],
  ['E5', 'C5', 'A4', 'E5', 'C5', 'Ab4'],
].map(bar => bar.map(n => Music.noteNameToFrequency[n]))

const NoiseGen = () => {
  const filterUnits = Array(PASSES).fill().map(() => Filter.Biquad())

  return f => {
    const c = Filter.Biquad.BP(f/sampleRate, Q)
    return filterUnits.reduce(
      (v, filter) => filter(c, v),
      Generator.random() * A
    )
  }
}

const noiseL = NoiseGen(), noiseR = NoiseGen()
const limiter = Util.LimitRate(2)

return t => {
  const barIndex = Math.floor(t / TEMPO.barLength)
  const bar = NOTES[barIndex % NOTES.length]
  const noteLength = TEMPO.barLength / bar.length
  const noteIndex = Math.floor(TEMPO.timeInBar(t) / noteLength)
  const f = bar[noteIndex % bar.length]
  const a = Envelope.attack(TEMPO.noteLength(32), 2, t % noteLength)
    * Envelope.release(TEMPO.noteLength(32), noteLength, 2, t % noteLength)

  return [
    noiseL(f) * a,
    noiseR(f) * a,
  ]
}
