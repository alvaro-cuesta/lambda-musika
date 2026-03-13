import { Biquad } from './Biquad.js';

describe('Biquad core processor', () => {
  it('acts as passthrough for positive sample with identity coefficients', () => {
    const filter = Biquad();
    const coeff: [number, number, number, number, number] = [1, 0, 0, 0, 0];

    expect(filter(coeff, 0.25)).toBeCloseTo(0.25, 12);
  });

  it('acts as passthrough for negative sample with identity coefficients', () => {
    const filter = Biquad();
    const coeff: [number, number, number, number, number] = [1, 0, 0, 0, 0];

    expect(filter(coeff, -0.75)).toBeCloseTo(-0.75, 12);
  });

  it('keeps internal state between consecutive calls', () => {
    const filter = Biquad();
    const coeff: [number, number, number, number, number] = [0, 1, 0, 0, 0];

    expect(filter(coeff, 1)).toBeCloseTo(0, 12);
    expect(filter(coeff, 0)).toBeCloseTo(1, 12);
  });

  it('decays state after delayed sample is emitted', () => {
    const filter = Biquad();
    const coeff: [number, number, number, number, number] = [0, 1, 0, 0, 0];

    filter(coeff, 1);
    filter(coeff, 0);
    expect(filter(coeff, 0)).toBeCloseTo(0, 12);
  });
});

describe('Biquad coefficient factories', () => {
  function expectFiniteCoeff(coeff: number[]) {
    expect(coeff).toHaveLength(5);
    for (const value of coeff) {
      expect(Number.isFinite(value)).toBe(true);
    }
  }

  it('LP coefficients satisfy low-pass symmetry relationships', () => {
    const lp = Biquad.LP(0.2, 0.707);
    expectFiniteCoeff(lp);
    expect(lp[1]).toBeCloseTo(2 * lp[0], 12);
    expect(lp[2]).toBeCloseTo(lp[0], 12);
  });

  it('HP coefficients satisfy high-pass symmetry relationships', () => {
    const hp = Biquad.HP(0.2, 0.707);
    expectFiniteCoeff(hp);
    expect(hp[1]).toBeCloseTo(-2 * hp[0], 12);
    expect(hp[2]).toBeCloseTo(hp[0], 12);
  });

  it('BP coefficients satisfy band-pass antisymmetry relationships', () => {
    const bp = Biquad.BP(0.2, 0.707);
    expectFiniteCoeff(bp);
    expect(bp[1]).toBeCloseTo(0, 12);
    expect(bp[2]).toBeCloseTo(-bp[0], 12);
  });

  it('Notch coefficients mirror b1 and a1', () => {
    const notch = Biquad.Notch(0.2, 0.707);
    expectFiniteCoeff(notch);
    expect(notch[3]).toBeCloseTo(notch[1], 12);
    expect(notch[2]).toBeCloseTo(notch[0], 12);
  });

  it('Peak coefficients differ between boost and cut', () => {
    const boost = Biquad.Peak(0.25, 1, 6);
    const cut = Biquad.Peak(0.25, 1, -6);
    expectFiniteCoeff(boost);
    expectFiniteCoeff(cut);
    expect(boost).not.toEqual(cut);
  });

  it('LowShelf coefficients differ between boost and cut', () => {
    const lowBoost = Biquad.LowShelf(0.25, 6);
    const lowCut = Biquad.LowShelf(0.25, -6);
    expectFiniteCoeff(lowBoost);
    expectFiniteCoeff(lowCut);
    expect(lowBoost).not.toEqual(lowCut);
  });

  it('HighShelf coefficients differ between boost and cut', () => {
    const highBoost = Biquad.HighShelf(0.25, 6);
    const highCut = Biquad.HighShelf(0.25, -6);
    expectFiniteCoeff(highBoost);
    expectFiniteCoeff(highCut);
    expect(highBoost).not.toEqual(highCut);
  });
});
