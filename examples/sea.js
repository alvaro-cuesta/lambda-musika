const { Generator, Filter } = Musika

const NoiseGen = () => {
  const A = Math.SQRT1_2  // Amplitude = 0.707

  const filter = Filter.Biquad()
  return cutoff => {
    const coeff = Filter.Biquad.LP(cutoff/sampleRate, Math.SQRT1_2)
    return filter(coeff, Generator.random() * A)
  }
}

const noiseL = NoiseGen(), noiseR = NoiseGen()
const cutL = Generator.Sin(), cutR = Generator.Sin()

return t => [
  noiseL(300 + cutL(0.1, t) * 200),
  noiseR(300 + cutR(0.08, t) * 200),
]
