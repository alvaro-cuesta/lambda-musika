const {Generator, Envelope, Filter, Operator, Music, Util} = Musika


/* CONFIG */

// Song

const SONG_TEMPO = Music.Tempo(4, 4, 80)
const SONG_BARS = 36
const SONG_IN_LENGTH = 0.5
const SONG_OUT_LENGTH = 0.5
const SONG_STRUCTURE = [
  {
    melodyKey: 'E',
    bassNote: 'E2',
  },
  {
    melodyKey: 'C',
    bassNote: 'C2',
  },
]
const SONG_BARS_REPEAT = 4

const MELODY_NOTE_VALUE = 8
const MELODY_NOTE_LENGTH = SONG_TEMPO.noteLength(MELODY_NOTE_VALUE)
const MELODY_ACCENT = [1, 5]
const MELODY_NON_ACCENT_ATTENUATION = 0.5
const MELODY_PANNED_AMPLITUDE = 0.7
const MELODY_SCALE = Music.scale.pentatonic.minor
const MELODY_OCTAVES = [3, 4]
const MELODY_CHANGE_CHANCE = 0.8
const MELODY_PLAY_CHANCE = 0.7

const BASS_NOTE_VALUE = 2
const BASS_NOTE_LENGTH = SONG_TEMPO.noteLength(BASS_NOTE_VALUE)

const DRUM_NOTE_VALUE = 8
const DRUM_NOTE_LENGTH = SONG_TEMPO.noteLength(DRUM_NOTE_VALUE)
const DRUM_PLAYS_IN = [1, 5, 6]

const SNARE_NOTE_VALUE = 8
const SNARE_NOTE_LENGTH = SONG_TEMPO.noteLength(SNARE_NOTE_VALUE)
const SNARE_PLAYS_IN = [3, 7]

// Instruments

const MELODY_VIBRATO_DEPTH = 0.5
const MELODY_VIBRATO_RATE = 4  // Cycles per note

const DRUM_FREQUENCY = 78
const DRUM_AMPLITUDE = 0.7
const DRUM_ATTACK = 0.01
const DRUM_ENVELOPE = [[0, 0], [DRUM_ATTACK, DRUM_FREQUENCY], [DRUM_NOTE_LENGTH, 0]]

const SNARE_AMPLITUDE = 0.2
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

  return (semitone, t) => osc(Music.semitoneToFrequency(semitone), t)
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
  return Generator.random() * SNARE_AMPLITUDE
    * Envelope.release(SNARE_NOTE_LENGTH, SNARE_NOTE_LENGTH, SNARE_DECAY_POWER, t)
}


/* SONG */

const SONG_LENGTH = SONG_IN_LENGTH + SONG_BARS * SONG_TEMPO.barLength + SONG_OUT_LENGTH
setLength(SONG_LENGTH)

let lastSongStructureIndex
let lastMelodyIndex
let melodyPlays
let melodySemitones
let chosenSemitone
let left = Math.random() < 0.5

let melodyInstrument = MelodyInstrument()
let bassInstrument = BassInstrument()
let drumInstrument = DrumInstrument()

return t => {
  if (t < SONG_IN_LENGTH) return [0, 0]
  if (t > (SONG_LENGTH - SONG_OUT_LENGTH)) return [0, 0]

  t = t - SONG_IN_LENGTH

  // Song

  let songStructureIndex = Math.floor((SONG_TEMPO.currentBar(t) - 1) / SONG_BARS_REPEAT)
  let {melodyKey, bassNote} = SONG_STRUCTURE[songStructureIndex % SONG_STRUCTURE.length]
  if (songStructureIndex !== lastSongStructureIndex) {
    melodySemitones = []
    for (let o of MELODY_OCTAVES) {
      Array.prototype.push.apply(melodySemitones, Music.extend(`${melodyKey}${o}`, MELODY_SCALE))
    }

    lastSongStructureIndex = songStructureIndex
  }

  // Melody

  let currentMelodyIndex = SONG_TEMPO.currentNoteInBar(MELODY_NOTE_VALUE, t)
  if (lastMelodyIndex !== currentMelodyIndex) {
    if (!chosenSemitone || Math.random() < MELODY_CHANGE_CHANCE) {
      chosenSemitone = Util.choose(melodySemitones)
      left = !left;
    }

    melodyPlays = Math.random() < MELODY_PLAY_CHANCE

    lastMelodyIndex = currentMelodyIndex
  }

  let melody = [0, 0]

  if (melodyPlays) {
    let mono = melodyInstrument(
      chosenSemitone,
      SONG_TEMPO.timeInNote(MELODY_NOTE_VALUE, t)
    )
    let a = !SONG_TEMPO.isInBar(MELODY_ACCENT, MELODY_NOTE_VALUE, t)
      ? MELODY_NON_ACCENT_ATTENUATION
      : 1
    let panning = left ? -MELODY_PANNED_AMPLITUDE : MELODY_PANNED_AMPLITUDE

    melody = Operator.panner(mono * a, panning)
  }

  //

  let bass = bassInstrument(
    Music.noteNameToSemitone[bassNote],
    SONG_TEMPO.timeInNote(BASS_NOTE_VALUE, t)
  )

  let drum = SONG_TEMPO.isInBar(DRUM_PLAYS_IN, DRUM_NOTE_VALUE, t)
    ? drumInstrument(SONG_TEMPO.timeInNote(DRUM_NOTE_VALUE, t))
    : 0

  let snare = SONG_TEMPO.isInBar(SNARE_PLAYS_IN, SNARE_NOTE_VALUE, t)
    ? snareInstrument(SONG_TEMPO.timeInNote(SNARE_NOTE_VALUE, t))
    : 0

  return [
    Operator.mixN(melody[0], bass, drum, snare),
    Operator.mixN(melody[1], bass, drum, snare),
  ]
}
