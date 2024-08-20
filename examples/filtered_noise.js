const { Generator, Filter } = Musika

const NoiseGen = () => {
  const A = Math.SQRT1_2  // Amplitude = 0.707
  const COEFF = Filter.Biquad.LP(400/sampleRate, Math.SQRT1_2)  // Cutoff = 400Hz, Q = 0.707

  const filter = Filter.Biquad()
  return () => filter(COEFF, Generator.random() * A)
}

const noiseL = NoiseGen(), noiseR = NoiseGen()

return () => [
  noiseL(),
  noiseR(),
]
