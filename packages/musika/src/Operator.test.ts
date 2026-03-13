import { mix, mixN, panner } from './Operator.js';

describe('mix', () => {
  it('uses a 50/50 ratio by default', () => {
    expect(mix(0.2, 0.8)).toBeCloseTo(0.5);
  });

  it('uses the provided ratio to weight the first and second signal', () => {
    expect(mix(0.2, 0.8, 0.25)).toBeCloseTo(0.65);
    expect(mix(0.2, 0.8, 0.75)).toBeCloseTo(0.35);
  });

  it('matches the endpoints for ratio 0 and 1', () => {
    expect(mix(0.2, 0.8, 0)).toBeCloseTo(0.8);
    expect(mix(0.2, 0.8, 1)).toBeCloseTo(0.2);
  });
});

describe('mixN', () => {
  it('returns 0 when called with no signals', () => {
    expect(mixN()).toBe(0);
  });

  it('returns the same value for a single signal', () => {
    expect(mixN(0.42)).toBeCloseTo(0.42);
  });

  it('averages multiple signals', () => {
    expect(mixN(1, 0, -1, 0.5)).toBeCloseTo(0.125);
  });
});

describe('panner', () => {
  it('pans fully left at -1', () => {
    expect(panner(2, -1)).toEqual([2, 0]);
  });

  it('centers equally at 0', () => {
    expect(panner(2, 0)).toEqual([1, 1]);
  });

  it('pans fully right at 1', () => {
    expect(panner(2, 1)).toEqual([0, 2]);
  });

  it('does not clamp out-of-range positions', () => {
    expect(panner(2, 2)).toEqual([-1, 3]);
  });
});
