import type { Time } from '@lambda-musika/audio';
import { attack, invAttack, invRelease, linear, release } from './Envelope.js';

const t = (value: number) => value as Time;

describe('attack', () => {
  it('clamps to 0 when time is below 0', () => {
    expect(attack(2, t(-0.5))).toBe(0);
  });

  it('uses default curve when only length and time are provided', () => {
    expect(attack(2, t(1))).toBeCloseTo(0.25, 12);
  });

  it('uses the explicit curve parameter', () => {
    expect(attack(2, 3, t(1))).toBeCloseTo(0.125, 12);
  });

  it('clamps to 1 after attack length', () => {
    expect(attack(2, 3, t(2.5))).toBe(1);
  });
});

describe('invAttack', () => {
  it('clamps to 0 when time is below 0', () => {
    expect(invAttack(2, t(-0.5))).toBe(0);
  });

  it('uses default curve when only length and time are provided', () => {
    expect(invAttack(2, t(1))).toBeCloseTo(0.75, 12);
  });

  it('uses the explicit curve parameter', () => {
    expect(invAttack(2, 3, t(1))).toBeCloseTo(0.875, 12);
  });

  it('clamps to 1 after attack length', () => {
    expect(invAttack(2, 3, t(3))).toBe(1);
  });
});

describe('release', () => {
  it('clamps to 1 when time is below 0', () => {
    expect(release(1, 3, t(-0.5))).toBe(1);
  });

  it('uses default curve when only releaseTime, totalTime and time are provided', () => {
    expect(release(1, 3, t(2.5))).toBeCloseTo(0.25, 12);
  });

  it('stays at 1 before release starts', () => {
    expect(release(1, 3, t(1))).toBe(1);
  });

  it('uses explicit curve during release', () => {
    expect(release(1, 3, 2, t(2.5))).toBeCloseTo(0.25, 12);
  });

  it('returns 0 after total time', () => {
    expect(release(1, 3, t(3.1))).toBe(0);
  });
});

describe('invRelease', () => {
  it('clamps to 1 when time is below 0', () => {
    expect(invRelease(1, 3, t(-0.5))).toBe(1);
  });

  it('uses default curve when only releaseTime, totalTime and time are provided', () => {
    expect(invRelease(1, 3, t(2.5))).toBeCloseTo(0.75, 12);
  });

  it('stays at 1 before release starts', () => {
    expect(invRelease(1, 3, t(1))).toBe(1);
  });

  it('uses explicit curve during release', () => {
    expect(invRelease(1, 3, 2, t(2.5))).toBeCloseTo(0.75, 12);
  });

  it('returns 0 after total time', () => {
    expect(invRelease(1, 3, t(3.1))).toBe(0);
  });
});

describe('linear', () => {
  it('returns 0 when no points are provided', () => {
    expect(linear([], 0.5)).toBe(0);
  });

  it('returns 0 when only one point is provided', () => {
    expect(linear([[0, 1]], 0.5)).toBe(0);
  });

  it('returns first point value before first x', () => {
    expect(
      linear(
        [
          [1, 2],
          [2, 4],
        ],
        0.5,
      ),
    ).toBe(2);
  });

  it('interpolates between adjacent points', () => {
    expect(
      linear(
        [
          [1, 2],
          [2, 4],
          [3, 1],
        ],
        1.5,
      ),
    ).toBeCloseTo(3, 12);
  });

  it('returns the last value after the final point', () => {
    expect(
      linear(
        [
          [1, 2],
          [2, 4],
          [3, 1],
        ],
        4,
      ),
    ).toBe(1);
  });
});
