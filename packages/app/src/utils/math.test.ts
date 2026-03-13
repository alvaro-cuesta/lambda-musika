import { describe, expect, it } from 'vitest';
import { clamp } from './math.js';

describe('clamp', () => {
  it('returns min for values below range', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('returns max for values above range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('returns the value when already inside range', () => {
    expect(clamp(42, 0, 100)).toBe(42);
  });
});
