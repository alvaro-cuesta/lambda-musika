import { describe, expect, it } from 'vitest';
import { toMinsSecs } from './time.js';

describe('toMinSecs', () => {
  it('converts seconds', () => {
    expect(toMinsSecs(0 * 60 + 0)).toBe('00:00');
    expect(toMinsSecs(0 * 60 + 10)).toBe('00:10');
  });

  it('converts minutes and seconds', () => {
    expect(toMinsSecs(1 * 60 + 10)).toBe('01:10');
    expect(toMinsSecs(10 * 60 + 0)).toBe('10:00');
    expect(toMinsSecs(10 * 60 + 10)).toBe('10:10');
  });

  it('pads single digit minutes and seconds', () => {
    expect(toMinsSecs(0 * 60 + 5)).toBe('00:05');
    expect(toMinsSecs(1 * 60 + 5)).toBe('01:05');
    expect(toMinsSecs(10 * 60 + 5)).toBe('10:05');
  });

  it('floors seconds', () => {
    expect(toMinsSecs(10.9)).toBe('00:10');
    expect(toMinsSecs(70.9)).toBe('01:10');
  });

  it('handles large numbers', () => {
    expect(toMinsSecs(60 * 60 + 0)).toBe('60:00');
    expect(toMinsSecs(61 * 60 + 1)).toBe('61:01');
  });

  it('handles negative numbers', () => {
    expect(toMinsSecs(-10)).toBe('-00:10');
    expect(toMinsSecs(-70)).toBe('-01:10');
    expect(toMinsSecs(-3661)).toBe('-61:01');
  });

  it('handles zero', () => {
    expect(toMinsSecs(0)).toBe('00:00');
  });

  it('handles non-numeric input gracefully', () => {
    expect(toMinsSecs(NaN)).toBe('NaN:NaN');
    expect(toMinsSecs(Infinity)).toBe('NaN:NaN');
  });

  it('breaks on >= 100 hours', () => {
    expect(toMinsSecs(100 * 60 + 0)).toBe('100:00');
    expect(toMinsSecs(100 * 60 + 1)).toBe('100:01');
  });
});
