const {Generator} = Musika

const F = 79            // Base frequency
const DF = 4            // Beat frequency
const A = Math.SQRT1_2  // Amplitude

const oscL = Generator.Sin(), oscR = Generator.Sin()

return t => [oscL(F, t) * A, oscR(F + DF, t) * A]
