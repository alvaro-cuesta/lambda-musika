import { describe, expectTypeOf, it } from 'vitest';
import type {
  MonoRenderer,
  MonoSignal,
  StereoRenderer,
  StereoSignal,
  Time,
} from './index.js';

describe('audio types', () => {
  it('keeps renderer signatures aligned with signal and time types', () => {
    expectTypeOf<MonoRenderer>().toEqualTypeOf<(t: Time) => MonoSignal>();
    expectTypeOf<StereoRenderer>().toEqualTypeOf<(t: Time) => StereoSignal>();
  });

  it('keeps stereo signal as a tuple of two channels', () => {
    expectTypeOf<StereoSignal>().toEqualTypeOf<[number, number]>();
  });

  it('brands time to avoid accidental plain-number usage', () => {
    expectTypeOf<Time>().not.toEqualTypeOf<number>();
  });
});
