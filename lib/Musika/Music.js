/* Built-in music utilities */

const SEMITONES_PER_OCTAVE = 12
const A = Math.pow(2, 1/SEMITONES_PER_OCTAVE)
const BASE_FREQ = 440                       // A4 = 440Hz
const LOWEST_SEMITONE_DIFF_FROM_BASE = -57  // C0 = -57 semitones from A4
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const PITCHES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
const ACCIDENTALS = {
  'bb': -2,
  '♭♭': -2,
  '𝄫': -2,
  'b': -1,
  '♭': -1,
  '': 0,
  '♮': 0,
  '♯': 1,
  '#': 1,
  '♯♯': 2,
  '##': 2,
  '𝄪': 2,
}

export {SEMITONES_PER_OCTAVE, A, BASE_FREQ, LOWEST_SEMITONE_DIFF_FROM_BASE, OCTAVES, PITCHES, ACCIDENTALS}

export function semitoneToFrequency(semitonesFromBaseTone) {
  return BASE_FREQ * Math.pow(A, semitonesFromBaseTone)
}

const noteNameToSemitone = {}
const noteNameToFrequency = {}

for (let octave of OCTAVES) {
  for (let pitch of Object.keys(PITCHES)) {
    for (let accidental of Object.keys(ACCIDENTALS)) {
      let noteName = `${pitch}${accidental}${octave}`
      let absoluteSemitone = LOWEST_SEMITONE_DIFF_FROM_BASE
        + (octave * SEMITONES_PER_OCTAVE)
        + PITCHES[pitch]
        + ACCIDENTALS[accidental]

      noteNameToSemitone[noteName] = absoluteSemitone
      noteNameToFrequency[noteName] = semitoneToFrequency(absoluteSemitone)
    }
  }
}

export {noteNameToSemitone, noteNameToFrequency}

export function Tempo(bpb, bv, bpm) {
  let beatLength = 60/bpm
  let barLength = bpb * beatLength

  function timeInBar(t) {
    return t % barLength
  }

  function currentBar(t) {
    return 1 + Math.floor(t / barLength)
  }

  function noteLength(noteValue = bv) {
    return beatLength * bv/noteValue
  }

  function timeInNote(noteValue, t) {
    if (typeof t === 'undefined') {
      t = noteValue
      noteValue = bv
    }

    return t % noteLength(noteValue)
  }

  function currentNoteInBar(noteValue, t) {
    if (typeof t === 'undefined') {
      t = noteValue
      noteValue = bv
    }

    return 1 + Math.floor(timeInBar(t) / noteLength(noteValue))
  }

  function isInBar(which, noteValue, t) {
    return which.indexOf(currentNoteInBar(noteValue, t)) !== -1
  }

  return {
    beatLength: beatLength,
    barLength: barLength,
    timeInBar: timeInBar,
    currentBar: currentBar,
    noteLength: noteLength,
    timeInNote: timeInNote,
    currentNoteInBar: currentNoteInBar,
    isInBar: isInBar,
  }
}

const interval = {
  'unison': 0,
  '1': 0,
  'P1': 0,
  'm2': 1,
  '2': 2,
  'M2': 2,
  'm3': 3,
  '3': 4,
  'M3': 4,
  '4': 5,
  'P4': 5,
  '#4': 6,
  '♯4': 6,
  'A4': 6,
  'TT': 6,
  'b5': 6,
  '♭5': 6,
  'd5': 6,
  '5': 7,
  'P5': 7,
  'A5': 8,
  'm6': 8,
  '6': 9,
  'M6': 9,
  'd7': 9,
  'm7': 10,
  '7': 11,
  'M7': 11,
  'octave': 12,
  '8': 12,
  'P8': 12,
  'm9': 13,
  'b9': 13,
  '♭9': 13,
  '9': 14,
  '#9': 15,
  '♯9': 15,
  '11': 17,
  '#11': 18,
  '♯11': 18,
  '13': 21,
}

const chord = {}

// Triads
chord['']     = ['1', '3', '5']
chord['m']    = ['1', 'm3', '5']
chord['+']    = ['1', '3', 'A5']
chord['dim']  = ['1', 'm3', 'd5']
chord['sus2'] = ['1', '2', '5']
chord['sus4'] = ['1', '4', '5']

// 7th tetrads
chord['maj7'] = ['1', '3', '5', '7']
chord['7']    = ['1', '3', '5', 'm7']
chord['+7']   = ['1', '3', 'A5', 'm7']
chord['m7']   = ['1', 'm3', '5', 'm7']
chord['mM7']  = ['1', 'm3', '5', '7']
chord['m7b5'] = ['1', 'm3', 'd5', 'm7']
chord['dim7']   = ['1', 'm3', 'd5', 'd7']

// Extended
chord['9']    = ['1', 'm3', 'd5', 'd7', '9']
chord['13']   = ['1', 'm3', 'd5', 'd7', '9', '13']

// Other
chord['5']    = ['1', '5', '8']

for (let name of Object.keys(chord)) {
  chord[name] = chord[name].map(i => interval[i])
}

// Aliases
chord['M']     = chord['maj']  = chord['Maj']   = chord['Δ']       = chord['']
chord['-']     = chord['min']  = chord['m']
chord['aug']   = chord['+']
chord['o']     = chord['º']    = chord['°']     = chord['dim']
chord['2']     = chord['sus2']
chord['4']     = chord['sus4']

chord['M7']    = chord['Maj7'] = chord['Δ7']    = chord['maj7']
chord['dom']   = chord['dom7'] = chord['7']
chord['aug7']  = chord['+7']
chord['min7']  = chord['-7']   = chord['m7']
chord['mMaj7'] = chord['mΔ7']  = chord['minΔ7'] = chord['minMaj7'] = chord['mM7']
chord['ø']     = chord['Ø']    = chord['m7b5']
chord['o7']    = chord['º7']   = chord['°7']    = chord['dim7']

const scale = {}

// Heptatonic
scale.major =      ['1', '2', '3', '4', '5', '6', '7']
scale.minor =      ['1', '2', 'm3', '4', '5', 'm6', 'm7']
scale.harmonic =   ['1', '2', 'm3', '4', '5', 'm6', '7']
scale.melodic =    ['1', '2', 'm3', '4', '5', '6', '7']

// Major modes
scale.lydian =     ['1', '2', '3', 'A4', '5', '6', '7']
// scale.ionian = scale.major
scale.mixolydian = ['1', '2', '3', '4', '5', '6', 'm7']
scale.dorian =     ['1', '2', 'm3', '4', '5', '6', 'm7']
// scale.aeolian = scale.minor
scale.phrygian =   ['1', 'm2', 'm3', '4', '5', 'm6', 'm7']
scale.locrian =    ['1', 'm2', 'm3', '4', 'd5', 'm6', 'm7']

for (let name of Object.keys(scale)) {
  scale[name] = scale[name].map(i => interval[i])
}

// Pentatonic
scale.pentatonic = {}
scale.pentatonic.major = ['1', '2', '3', '5', '6']
scale.pentatonic.minor = ['1', 'm3', '4', '5', 'm7']

for (let name of Object.keys(scale.pentatonic)) {
  scale.pentatonic[name] = scale.pentatonic[name].map(i => interval[i])
}

// Aliases
scale.ionian = scale.major
scale.aeolian = scale.minor

export {interval, chord, scale}

export function extend(fundamental, type) {
  let semitones = Array.isArray(type)
    ? type
    : chordSemitones(type)

  return semitones.map(d => noteNameToSemitone[fundamental] + d)
}

import * as myself from './Music.js'
export default myself
