const {Generator, Envelope, Filter, Operator, Music, Util} = Musika

const CHORD_LENGTH = 3
const CHORDS = [
  ['A2',  [0, 3, 7]],
  ['A2',  [0, 3, 7]],
  ['A2',  [0, 3, 8]],
  ['A2',  [0, 3, 8]],
  ['A2',  [0, 3, 7]],
  ['A2',  [0, 3, 8]],
  ['A2',  [0, 3, 8]],
  ['D2',  [0, 3, 8]],
  ['Bb2', [7, 4, 0]],
  ['Bb2', [7, 4, 0]],
  ['Bb2', [9, 4, 0]],
  ['F2',  [7, 2, 0]],
  ['F2',  [7, 2, 0]],
].map(([n, s]) => Music.extend(n, s))

const Note = A => {
  const OSC = Generator.Saw()
  return (f, t) => OSC(f, t) * Note.RELEASE(t % Note.LENGTH) * A
}
Note.LENGTH = 0.1
Note.RELEASE = Util.curry(Envelope.release, 0.08, Note.LENGTH, 1.2)

const Detune = (A, F) => {
  const OSC = Generator.Saw()
  return t => OSC(F, t) * A
}

/* SONG */

let detune = Detune(0.1, 0.4)
let losc = Note(0.05)
let rosc = Note(0.05)

return t => {
  let note_in_song = Math.floor(t / Note.LENGTH)
  let chord_i = Math.floor(note_in_song / CHORD_LENGTH) % CHORDS.length
  let note_i = note_in_song % CHORD_LENGTH
  let f = Music.semitoneToFrequency(CHORDS[chord_i][note_i])

  let l = losc(f, t)
  let r = rosc(f + detune(t), t)

  return [l, r]
}
