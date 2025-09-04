/**
 * @module Built-in music utilities
 */

/**
 * The number of semitones in an octave.
 */
export const SEMITONES_PER_OCTAVE = 12;

/**
 * The frequency ratio between adjacent semitones.
 */
export const A = Math.pow(2, 1 / SEMITONES_PER_OCTAVE);

/**
 * The base frequency (A4 = 440Hz).
 *
 * _(Sorry guys, no 432Hz for you yet...)_
 */
export const BASE_FREQ = 440; // A4 = 440Hz

/**
 * The lowest semitone difference from the base frequency (A4 = 440Hz).
 */
export const LOWEST_SEMITONE_DIFF_FROM_BASE = -57; // C0 = -57 semitones from A4

/**
 * The available octaves.
 */
export const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Maps pitch name (English naming system: C, D, E, etc.) to semitones.
 */
export const pitch = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  c: 0,
  d: 2,
  e: 4,
  f: 5,
  g: 7,
  a: 9,
  b: 11,
} as const;

/**
 * Maps accidental symbols (♭, ♯, etc.) to their corresponding semitone adjustments.
 */
export const accidental = {
  bb: -2,
  '♭♭': -2,
  '𝄫': -2,
  b: -1,
  '♭': -1,
  '': 0,
  '♮': 0,
  '♯': 1,
  '#': 1,
  '♯♯': 2,
  '##': 2,
  '𝄪': 2,
} as const;

/**
 * Converts a number of semitones from the base tone (A4 = 440Hz) to its corresponding frequency in Hz.
 *
 * @param semitonesFromBaseTone The number of semitones from the base tone (A4 = 440Hz).
 * @returns The frequency in Hz.
 */
export function semitoneToFrequency(semitonesFromBaseTone: number) {
  return BASE_FREQ * Math.pow(A, semitonesFromBaseTone);
}

export type NoteName =
  `${keyof typeof pitch}${keyof typeof accidental}${(typeof OCTAVES)[number]}`;

export const noteNameToSemitone = {} as Record<NoteName, number>;
export const noteNameToFrequency = {} as Record<NoteName, number>;

for (const o of OCTAVES) {
  for (const p of Object.keys(pitch) as (keyof typeof pitch)[]) {
    for (const a of Object.keys(accidental) as (keyof typeof accidental)[]) {
      const noteName = `${p}${a}${o}` as const;
      const absoluteSemitone =
        LOWEST_SEMITONE_DIFF_FROM_BASE +
        o * SEMITONES_PER_OCTAVE +
        pitch[p] +
        accidental[a];

      noteNameToSemitone[noteName] = absoluteSemitone;
      noteNameToFrequency[noteName] = semitoneToFrequency(absoluteSemitone);
    }
  }
}

// @todo This makes it hard to use tempos that change over time.
/**
 * Calculates the tempo information for a piece of music.
 *
 * @param bpb The number of beats per bar.
 * @param bv The beat value (e.g., 4 for quarter notes).
 * @param bpm The beats per minute.
 * @returns An object containing tempo information.
 */
export function Tempo(bpb: number, bv: number, bpm: number) {
  const beatLength = 60 / bpm;
  const barLength = bpb * beatLength;

  function timeInBar(t: number) {
    return t % barLength;
  }

  function currentBar(t: number) {
    return 1 + Math.floor(t / barLength);
  }

  function noteLength(noteValue = bv) {
    return (beatLength * bv) / noteValue;
  }

  function timeInNote(noteValue: number, t: number) {
    if (typeof t === 'undefined') {
      t = noteValue;
      noteValue = bv;
    }

    return t % noteLength(noteValue);
  }

  function currentNoteInBar(noteValue: number, t: number) {
    if (typeof t === 'undefined') {
      t = noteValue;
      noteValue = bv;
    }

    return 1 + Math.floor(timeInBar(t) / noteLength(noteValue));
  }

  function isInBar(which: number[], noteValue: number, t: number) {
    return which.includes(currentNoteInBar(noteValue, t));
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
  };
}

export const interval = {
  unison: 0,
  '1': 0,
  P1: 0,
  m2: 1,
  '2': 2,
  M2: 2,
  m3: 3,
  '3': 4,
  M3: 4,
  '4': 5,
  P4: 5,
  '#4': 6,
  '♯4': 6,
  A4: 6,
  TT: 6,
  b5: 6,
  '♭5': 6,
  d5: 6,
  '5': 7,
  P5: 7,
  A5: 8,
  m6: 8,
  '6': 9,
  M6: 9,
  d7: 9,
  m7: 10,
  '7': 11,
  M7: 11,
  octave: 12,
  '8': 12,
  P8: 12,
  m9: 13,
  b9: 13,
  '♭9': 13,
  '9': 14,
  '#9': 15,
  '♯9': 15,
  '11': 17,
  '#11': 18,
  '♯11': 18,
  '13': 21,
} as const;

export type ChordName =
  | ''
  | 'M'
  | 'maj'
  | 'Maj'
  | 'Δ'
  | 'm'
  | '-'
  | 'min'
  | '+'
  | 'aug'
  | 'dim'
  | 'o'
  | 'º'
  | '°'
  | 'sus2'
  | '2'
  | 'sus4'
  | '4'
  | '7'
  | 'dom'
  | 'dom7'
  | '+7'
  | 'aug7'
  | 'maj7'
  | 'M7'
  | 'Maj7'
  | 'Δ7'
  | 'm7'
  | 'min7'
  | '-7'
  | 'mM7'
  | 'mMaj7'
  | 'mΔ7'
  | 'minΔ7'
  | 'minMaj7'
  | 'm7b5'
  | 'ø'
  | 'Ø'
  | 'dim7'
  | 'o7'
  | 'º7'
  | '°7'
  | '9'
  | '13'
  | '5';

function toIntervals(arr: (keyof typeof interval)[]) {
  return arr.map((i) => interval[i]);
}

/* eslint-disable @typescript-eslint/dot-notation -- some would have dot notation, some wouldn't, which makes this even worse */
export const chord = {} as Record<ChordName, number[]>;
// Triads
chord[''] =
  chord['M'] =
  chord['maj'] =
  chord['Maj'] =
  chord['Δ'] =
    toIntervals(['1', '3', '5']);
chord['m'] = chord['-'] = chord['min'] = toIntervals(['1', 'm3', '5']);
chord['+'] = chord['aug'] = toIntervals(['1', '3', 'A5']);
chord['dim'] =
  chord['o'] =
  chord['º'] =
  chord['°'] =
    toIntervals(['1', 'm3', 'd5']);
chord['sus2'] = chord['2'] = toIntervals(['1', '2', '5']);
chord['sus4'] = chord['4'] = toIntervals(['1', '4', '5']);
// 7th tetrads
chord['maj7'] =
  chord['M7'] =
  chord['Maj7'] =
  chord['Δ7'] =
    toIntervals(['1', '3', '5', '7']);
chord['7'] = chord['dom'] = chord['dom7'] = toIntervals(['1', '3', '5', 'm7']);
chord['+7'] = chord['aug7'] = toIntervals(['1', '3', 'A5', 'm7']);
chord['m7'] = chord['min7'] = chord['-7'] = toIntervals(['1', 'm3', '5', 'm7']);
chord['mM7'] =
  chord['mMaj7'] =
  chord['mΔ7'] =
  chord['minΔ7'] =
  chord['minMaj7'] =
    toIntervals(['1', 'm3', '5', '7']);
chord['m7b5'] = chord['ø'] = chord['Ø'] = toIntervals(['1', 'm3', 'd5', 'm7']);
chord['dim7'] =
  chord['o7'] =
  chord['º7'] =
  chord['°7'] =
    toIntervals(['1', 'm3', 'd5', 'd7']);
// Extended
chord['9'] = toIntervals(['1', 'm3', 'd5', 'd7', '9']);
chord['13'] = toIntervals(['1', 'm3', 'd5', 'd7', '9', '13']);
// Other
chord['5'] = toIntervals(['1', '5', '8']);
/* eslint-enable @typescript-eslint/dot-notation */

export type ScaleName =
  | 'major'
  | 'minor'
  | 'harmonic'
  | 'melodic'
  | 'lydian'
  | 'ionian'
  | 'mixolydian'
  | 'dorian'
  | 'aeolian'
  | 'phrygian'
  | 'locrian';

export type PentatonicScaleName = 'major' | 'minor';

export const scale = {} as Record<ScaleName, number[]> & {
  pentatonic: Record<PentatonicScaleName, number[]>;
};
// Heptatonic
scale.major = toIntervals(['1', '2', '3', '4', '5', '6', '7']);
scale.minor = toIntervals(['1', '2', 'm3', '4', '5', 'm6', 'm7']);
scale.harmonic = toIntervals(['1', '2', 'm3', '4', '5', 'm6', '7']);
scale.melodic = toIntervals(['1', '2', 'm3', '4', '5', '6', '7']);
// Major modes
scale.lydian = toIntervals(['1', '2', '3', 'A4', '5', '6', '7']);
scale.ionian = scale.major;
scale.mixolydian = toIntervals(['1', '2', '3', '4', '5', '6', 'm7']);
scale.dorian = toIntervals(['1', '2', 'm3', '4', '5', '6', 'm7']);
scale.aeolian = scale.minor;
scale.phrygian = toIntervals(['1', 'm2', 'm3', '4', '5', 'm6', 'm7']);
scale.locrian = toIntervals(['1', 'm2', 'm3', '4', 'd5', 'm6', 'm7']);
// Pentatonic
scale.pentatonic = {} as Record<PentatonicScaleName, number[]>;
scale.pentatonic.major = toIntervals(['1', '2', '3', '5', '6']);
scale.pentatonic.minor = toIntervals(['1', 'm3', '4', '5', 'm7']);

/**
 * Extend a musical note by a series of intervals.
 *
 * @param fundamental The fundamental note (e.g., 'C4').
 * @param type The type of extension (e.g., 'maj7', '9', etc.) or a list of semitone offsets.
 * @returns An array of semitones representing the extended chord.
 */
export function extend(
  fundamental: NoteName,
  type: ChordName | number[],
): number[] {
  const semitones = Array.isArray(type) ? type : chord[type];

  return semitones.map((d) => noteNameToSemitone[fundamental] + d);
}
