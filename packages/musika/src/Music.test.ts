import type { Time } from '@lambda-musika/audio';
import {
  A,
  BASE_FREQ,
  LOWEST_SEMITONE_DIFF_FROM_BASE,
  SEMITONES_PER_OCTAVE,
  Tempo,
  chord,
  extend,
  interval,
  noteNameToFrequency,
  noteNameToSemitone,
  scale,
  semitoneToFrequency,
} from './Music.js';

const t = (value: number) => value as Time;

describe('semitoneToFrequency', () => {
  it('returns A4 for 0 semitones', () => {
    expect(semitoneToFrequency(0)).toBe(BASE_FREQ);
  });

  it('doubles the frequency after one octave', () => {
    expect(semitoneToFrequency(SEMITONES_PER_OCTAVE)).toBeCloseTo(
      BASE_FREQ * 2,
      10,
    );
  });

  it('uses the expected semitone ratio', () => {
    expect(semitoneToFrequency(1)).toBeCloseTo(BASE_FREQ * A, 12);
  });
});

describe('note tables', () => {
  it('maps C0 to the lowest semitone offset', () => {
    expect(noteNameToSemitone.C0).toBe(LOWEST_SEMITONE_DIFF_FROM_BASE);
  });

  it('maps A4 to semitone offset zero', () => {
    expect(noteNameToSemitone.A4).toBe(0);
  });

  it('maps sharp note names to semitone offsets', () => {
    expect(noteNameToSemitone['C#4']).toBe(-8);
  });

  it('maps lowercase note names with natural accidental', () => {
    expect(noteNameToSemitone['a♮4']).toBe(0);
  });

  it('maps A4 to 440Hz', () => {
    expect(noteNameToFrequency.A4).toBeCloseTo(440, 12);
  });

  it('maps note names to frequencies that match semitone conversion', () => {
    expect(noteNameToFrequency['C#4']).toBeCloseTo(semitoneToFrequency(-8), 12);
  });
});

describe('Tempo', () => {
  const tempo = Tempo(4, 4, 120);

  it('computes beat length', () => {
    expect(tempo.beatLength).toBeCloseTo(0.5, 12);
  });

  it('computes bar length', () => {
    expect(tempo.barLength).toBeCloseTo(2, 12);
  });

  it('computes position within the current bar', () => {
    expect(tempo.timeInBar(t(2.75))).toBeCloseTo(0.75, 12);
  });

  it('computes current bar index', () => {
    expect(tempo.currentBar(t(2.75))).toBe(2);
  });

  it('uses beat value as default for note length', () => {
    expect(tempo.noteLength()).toBeCloseTo(0.5, 12);
  });

  it('supports explicit note value for note length', () => {
    expect(tempo.noteLength(8)).toBeCloseTo(0.25, 12);
  });

  it('uses beat value as default for timeInNote', () => {
    expect(tempo.timeInNote(t(0.8))).toBeCloseTo(0.3, 12);
  });

  it('supports explicit note value for timeInNote', () => {
    expect(tempo.timeInNote(8, t(0.8))).toBeCloseTo(0.05, 12);
  });

  it('uses beat value as default for currentNoteInBar', () => {
    expect(tempo.currentNoteInBar(t(0.8))).toBe(2);
  });

  it('supports explicit note value for currentNoteInBar', () => {
    expect(tempo.currentNoteInBar(8, t(0.8))).toBe(4);
  });

  it('returns true when note index is included in selector', () => {
    expect(tempo.isInBar([2, 4], 8, t(0.8))).toBe(true);
  });

  it('returns false when note index is not included in selector', () => {
    expect(tempo.isInBar([1, 3], 8, t(0.8))).toBe(false);
  });
});

describe('interval, chord, and scale tables', () => {
  it('maps #4 to tritone value', () => {
    expect(interval['#4']).toBe(6);
  });

  it('maps ♯4 alias to same value as #4', () => {
    expect(interval['♯4']).toBe(interval['#4']);
  });

  it('maps P8 to same value as octave alias', () => {
    expect(interval.P8).toBe(interval.octave);
  });

  it('maps M triad to major triad intervals', () => {
    expect(chord.M).toEqual([0, 4, 7]);
  });

  it('maps maj alias to same intervals as M', () => {
    expect(chord.M).toEqual(chord.maj);
  });

  it('maps empty chord name to same intervals as Δ', () => {
    expect(chord['']).toEqual(chord.Δ);
  });

  it('maps m7b5 to same intervals as ø alias', () => {
    expect(chord.m7b5).toEqual(chord.ø);
  });

  it('maps major scale intervals', () => {
    expect(scale.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('maps ionian as alias of major', () => {
    expect(scale.ionian).toBe(scale.major);
  });

  it('maps aeolian as alias of minor', () => {
    expect(scale.aeolian).toBe(scale.minor);
  });

  it('maps minor pentatonic intervals', () => {
    expect(scale.pentatonic.minor).toEqual([0, 3, 5, 7, 10]);
  });
});

describe('extend', () => {
  it('extends a fundamental note with a chord name', () => {
    expect(extend('C4', 'M')).toEqual([-9, -5, -2]);
  });

  it('extends a fundamental note with custom semitone offsets', () => {
    expect(extend('A4', [0, 3, 7])).toEqual([0, 3, 7]);
  });
});
