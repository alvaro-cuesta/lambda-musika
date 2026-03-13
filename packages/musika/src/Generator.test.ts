import type { Time } from '@lambda-musika/audio';
import {
  LFNoise,
  LFNoise2,
  PositiveSaw,
  PositiveSquare,
  Saw,
  Sin,
  Square,
  Tri,
  random,
  random2,
} from './Generator.js';

const t = (value: number) => value as Time;

describe('Sin', () => {
  it('starts at zero phase for t = 0', () => {
    const sin = Sin();

    expect(sin(1, t(0))).toBeCloseTo(0, 12);
  });

  it('keeps phase continuity across subsequent calls', () => {
    const sin = Sin();

    sin(1, t(0));
    expect(sin(1, t(0.25))).toBeCloseTo(1, 12);
    expect(sin(1, t(0.5))).toBeCloseTo(0, 12);
    expect(sin(1, t(0.75))).toBeCloseTo(-1, 12);
  });
});

describe('Saw family', () => {
  describe('PositiveSaw', () => {
    it('starts at zero phase for t = 0', () => {
      const saw = PositiveSaw();

      expect(saw(1, t(0))).toBeCloseTo(0, 12);
    });

    it('repeats the waveform phase every period', () => {
      const saw = PositiveSaw();

      expect(saw(1, t(0))).toBeCloseTo(0, 12);
      expect(saw(1, t(0.25))).toBeCloseTo(0.25, 12);
      expect(saw(1, t(1.25))).toBeCloseTo(0.25, 12);
    });

    it('keeps phase continuity across subsequent calls', () => {
      const saw = PositiveSaw();

      expect(saw(2, t(0))).toBeCloseTo(0, 12);
      expect(saw(2, t(0.125))).toBeCloseTo(0.25, 12);
      expect(saw(2, t(0.25))).toBeCloseTo(0.5, 12);
    });
  });

  describe('Saw', () => {
    it('starts at zero phase for t = 0', () => {
      const saw = Saw();

      expect(saw(1, t(0))).toBeCloseTo(-1, 12);
    });

    it('outputs a bipolar sawtooth waveform', () => {
      const saw = Saw();

      expect(saw(1, t(0))).toBeCloseTo(-1, 12);
      expect(saw(1, t(0.25))).toBeCloseTo(-0.5, 12);
      expect(saw(1, t(0.75))).toBeCloseTo(0.5, 12);
    });

    it('keeps phase continuity across subsequent calls', () => {
      const saw = Saw();

      expect(saw(2, t(0))).toBeCloseTo(-1, 12);
      expect(saw(2, t(0.125))).toBeCloseTo(-0.5, 12);
      expect(saw(2, t(0.25))).toBeCloseTo(0, 12);
    });
  });
});

describe('Square family', () => {
  describe('PositiveSquare', () => {
    it('starts at zero phase for t = 0', () => {
      const square = PositiveSquare();

      expect(square(1, t(0))).toBe(0);
    });

    it('uses default pulse width when only time is provided', () => {
      const square = PositiveSquare();

      expect(square(1, t(0))).toBe(0);
      expect(square(1, t(0.75))).toBe(1);
    });

    it('uses explicit pulse width when provided', () => {
      const square = PositiveSquare();

      expect(square(1, 0.2, t(0.25))).toBe(1);
    });

    it('advances phase across subsequent calls with default pulse width', () => {
      const square = PositiveSquare();

      square(1, t(0));
      expect(square(1, t(0.4))).toBe(0);
      expect(square(1, t(0.6))).toBe(1);
    });
  });

  describe('Square', () => {
    it('starts at zero phase for t = 0', () => {
      const square = Square();

      expect(square(1, t(0))).toBe(-1);
    });

    it('uses default pulse width when only time is provided', () => {
      const square = Square();

      expect(square(1, t(0))).toBe(-1);
      expect(square(1, t(0.75))).toBe(1);
    });

    it('uses explicit pulse width when provided', () => {
      const square = Square();

      expect(square(1, 0.8, t(0.75))).toBe(-1);
    });

    it('advances phase across subsequent calls with default pulse width', () => {
      const square = Square();

      square(1, t(0));
      expect(square(1, t(0.4))).toBe(-1);
      expect(square(1, t(0.6))).toBe(1);
    });
  });
});

describe('Tri', () => {
  it('starts at zero phase for t = 0', () => {
    const tri = Tri();

    expect(tri(1, t(0))).toBeCloseTo(-1, 12);
  });

  it('outputs a triangle waveform shape', () => {
    const tri = Tri();

    expect(tri(1, t(0))).toBeCloseTo(-1, 12);
    expect(tri(1, t(0.25))).toBeCloseTo(0, 12);
    expect(tri(1, t(0.5))).toBeCloseTo(1, 12);
    expect(tri(1, t(0.75))).toBeCloseTo(0, 12);
  });

  it('keeps phase continuity across subsequent calls', () => {
    const tri = Tri();

    expect(tri(2, t(0))).toBeCloseTo(-1, 12);
    expect(tri(2, t(0.125))).toBeCloseTo(0, 12);
    expect(tri(2, t(0.25))).toBeCloseTo(1, 12);
  });
});

describe('Noise family', () => {
  describe('LFNoise', () => {
    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('starts from the first sampled value', () => {
      const randomSpy = vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.1);
      const noise = LFNoise(2);

      expect(noise(t(0))).toBeCloseTo(0.2, 12);
      expect(randomSpy).toHaveBeenCalledTimes(2);
    });

    it('linearly interpolates between sampled values', () => {
      vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.1);
      const noise = LFNoise(2);

      noise(t(0));
      expect(noise(t(0.25))).toBeCloseTo(0.4, 12);
    });

    it('updates sampled endpoint after crossing a period boundary', () => {
      const randomSpy = vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.1);
      const noise = LFNoise(2);

      noise(t(0));
      expect(noise(t(0.75))).toBeCloseTo(0.35, 12);
      expect(randomSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('LFNoise2', () => {
    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('outputs values in the bipolar range', () => {
      vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.25)
        .mockReturnValueOnce(0.75);
      const noise2 = LFNoise2(1);

      expect(noise2(t(0))).toBeCloseTo(-0.5, 12);
    });

    it('preserves linear transitions between updates', () => {
      vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.25)
        .mockReturnValueOnce(0.75);
      const noise2 = LFNoise2(1);

      noise2(t(0));
      expect(noise2(t(0.5))).toBeCloseTo(0, 12);
    });
  });

  describe('random', () => {
    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('returns a unipolar random value', () => {
      vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.6);

      expect(random()).toBeCloseTo(0.3, 12);
    });
  });

  describe('random2', () => {
    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('returns a bipolar random value', () => {
      vitest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.6);

      random();
      expect(random2()).toBeCloseTo(0.2, 12);
    });
  });
});
