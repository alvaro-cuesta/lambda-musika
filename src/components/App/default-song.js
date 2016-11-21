const {Generator, Envelope, Filter, Operator, Music, Util} = Musika


/* CONFIG */

const SONG_TEMPO = Music.Tempo(4, 4, 80)
const SONG_BARS = 32
const SONG_IN_LENGTH = 0.5
const SONG_OUT_LENGTH = 0.5

const MELODY_NOTE_VALUE = 8
const MELODY_NOTE_LENGTH = SONG_TEMPO.noteLength(MELODY_NOTE_VALUE)
const MELODY_ACCENT = [1, 5]
const MELODY_NON_ACCENT_ATTENUATION = 0.5
const MELODY_PANNED_AMPLITUDE = 0.7
const MELODY_KEY = 'C'
const MELODY_SCALE = Music.scale.pentatonic.minor
const MELODY_OCTAVES = [3, 4]
const MELODY_CHANGE_CHANCE = 0.8
const MELODY_PLAY_CHANCE = 0.9
const MELODY_VIBRATO_DEPTH = 0.5
const MELODY_VIBRATO_RATE = 4  // Cycles per note

const BASS_NOTE_VALUE = 2
const BASS_NOTE_LENGTH = SONG_TEMPO.noteLength(BASS_NOTE_VALUE)
const BASS_FREQUENCY = Music.noteNameToFrequency['C2']

const DRUM_NOTE_VALUE = 8
const DRUM_NOTE_LENGTH = SONG_TEMPO.noteLength(DRUM_NOTE_VALUE)
const DRUM_PLAYS_IN = [1, 5, 6]
const DRUM_FREQUENCY = 78
const DRUM_AMPLITUDE = 0.7
const DRUM_ATTACK = 0.01
const DRUM_ENVELOPE = [[0, 0], [DRUM_ATTACK, DRUM_FREQUENCY], [DRUM_NOTE_LENGTH, 0]]

const SNARE_NOTE_VALUE = 8
const SNARE_NOTE_LENGTH = SONG_TEMPO.noteLength(SNARE_NOTE_VALUE)
const SNARE_PLAYS_IN = [3, 7]
const SNARE_AMPLITUDE = 0.3
const SNARE_DECAY_POWER = 7


/* INSTRUMENTS */

function MelodyInstrument() {
  const osc = Generator.Sin()
  const vibratoOsc = Generator.Sin()

  return (semitone, t) => {
    const vibrato = vibratoOsc(MELODY_VIBRATO_RATE/MELODY_NOTE_LENGTH, t) * MELODY_VIBRATO_DEPTH

    return osc(Music.semitoneToFrequency(semitone + vibrato), t)
      * Envelope.invAttack(MELODY_NOTE_LENGTH/4, t)
      * Envelope.release(MELODY_NOTE_LENGTH, MELODY_NOTE_LENGTH, t)
  }
}

function BassInstrument() {
  const osc = Generator.Sin()

  return t => osc(BASS_FREQUENCY, t)
    * Envelope.invAttack(BASS_NOTE_LENGTH, t)
    * Envelope.release(BASS_NOTE_LENGTH, BASS_NOTE_LENGTH, t)
}

function DrumInstrument() {
  const bodyOsc = Generator.Sin()
  const popOsc = Generator.Sin()

  return t => {
    let body = 0.67 * bodyOsc(Envelope.linear(DRUM_ENVELOPE, t), t)
    let pop = 0.33 * popOsc(150 * Envelope.release(DRUM_NOTE_LENGTH - 0.0000001, DRUM_NOTE_LENGTH, t), t)

    return (body + pop) * DRUM_AMPLITUDE
      * Envelope.attack(DRUM_ATTACK, t)
      * Envelope.release(DRUM_NOTE_LENGTH - DRUM_ATTACK, DRUM_NOTE_LENGTH, t)
  }
}

function snareInstrument(t) {
  return Math.random() * SNARE_AMPLITUDE
    * Envelope.release(SNARE_NOTE_LENGTH, SNARE_NOTE_LENGTH, SNARE_DECAY_POWER, t)
}


/* SONG */

const SONG_LENGTH = SONG_IN_LENGTH + SONG_BARS * SONG_TEMPO.barLength + SONG_OUT_LENGTH
const MELODY_SEMITONES = []
for (let o of MELODY_OCTAVES) {
  Array.prototype.push.apply(MELODY_SEMITONES, Music.extend(`${MELODY_KEY}${o}`, MELODY_SCALE))
}

setLength(SONG_LENGTH)

let lastMelodyIndex
let melodyPlays
let chosenSemitone = Util.choose(MELODY_SEMITONES)
let left = Math.random() < 0.5

let melodyInstrument = MelodyInstrument()
let bassInstrument = BassInstrument()
let drumInstrument = DrumInstrument()

return (t) => {
  if (t < SONG_IN_LENGTH) return [0, 0]
  if (t > (SONG_LENGTH - SONG_OUT_LENGTH)) return [0, 0]

  t = t - SONG_IN_LENGTH

  let melodyT = SONG_TEMPO.timeInNote(MELODY_NOTE_VALUE, t)
  let bassT = SONG_TEMPO.timeInNote(BASS_NOTE_VALUE, t)
  let drumT = SONG_TEMPO.timeInNote(DRUM_NOTE_VALUE, t)
  let snareT = SONG_TEMPO.timeInNote(SNARE_NOTE_VALUE, t)

  let currentMelodyIndex = SONG_TEMPO.currentNoteInBar(MELODY_NOTE_VALUE, t)

  if (lastMelodyIndex !== currentMelodyIndex) {
    if (Math.random() < MELODY_CHANGE_CHANCE) {
      chosenSemitone = Util.choose(MELODY_SEMITONES)
      left = !left;
    }

    melodyPlays = Math.random() < MELODY_PLAY_CHANCE

    lastMelodyIndex = currentMelodyIndex
  }

  let melodyL = 0
  let melodyR = 0

  if (melodyPlays) {
    let melody = melodyInstrument(chosenSemitone, melodyT)
      * (!SONG_TEMPO.isInBar(MELODY_ACCENT, MELODY_NOTE_VALUE, t)
          ? MELODY_NON_ACCENT_ATTENUATION
          : 1)

    melodyL = melody
      * (left ? MELODY_PANNED_AMPLITUDE : (1 - MELODY_PANNED_AMPLITUDE))
    melodyR = melody
      * (!left ? MELODY_PANNED_AMPLITUDE : (1 - MELODY_PANNED_AMPLITUDE))
  }

  let bass = bassInstrument(bassT)
  let drum = SONG_TEMPO.isInBar(DRUM_PLAYS_IN, DRUM_NOTE_VALUE, t)
    ? drumInstrument(drumT)
    : 0
  let snare = SONG_TEMPO.isInBar(SNARE_PLAYS_IN, SNARE_NOTE_VALUE, t)
    ? snareInstrument(snareT)
    : 0

  let l = Operator.mixN(melodyL, bass, drum, snare)
  let r = Operator.mixN(melodyR, bass, drum, snare)

  return [l, r]
}
