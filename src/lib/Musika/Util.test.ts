import { curry, LimitRate } from './Util.js';

describe('curry', () => {
  it('curries a function with no arguments', () => {
    const f = () => 42;
    const curried = curry(f);
    expect(curried()).toBe(42);
  });

  it('curries a function with one argument', () => {
    const f = (x: number) => x + 1;
    const curried = curry(f, 41);
    expect(curried()).toBe(42);
  });

  it('curries a function with multiple arguments', () => {
    const f = (x: number, y: number) => x + y;
    const curried = curry(f, 40);
    expect(curried(2)).toBe(42);
  });

  it('curries a function with multiple arguments, all pre-filled', () => {
    const f = (x: number, y: number) => x + y;
    const curried = curry(f, 40, 2);
    expect(curried()).toBe(42);
  });
});

describe('LimitRate', () => {
  const f = vitest.fn((x: number) => x + 1);

  beforeEach(() => {
    f.mockClear();
  });

  it('calls the function immediately on the first call', () => {
    const limitedF = LimitRate(f, 2); // Limit to 2 calls per second
    const result = limitedF(0.5)(1); // timestamp = 0.5s
    expect(result).toBe(2);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith(1);
  });

  it('returns the last value if called again before the period', () => {
    const limitedF = LimitRate(f, 2); // Limit to 2 calls per second
    limitedF(0.5)(1); // First call at timestamp = 0.5s
    const result = limitedF(0.7)(2); // Second call at timestamp = 0.7s
    expect(result).toBe(2); // Should return last value (2)
    expect(f).toHaveBeenCalledTimes(1); // f should not be called again
  });

  it('calls the function again after the period has passed', () => {
    const limitedF = LimitRate(f, 2); // Limit to 2 calls per second
    limitedF(0.5)(1); // First call at timestamp = 0.5s
    limitedF(0.7)(2); // Second call at timestamp = 0.7s
    const result = limitedF(1.0)(3); // Third call at timestamp = 1.0s
    expect(result).toBe(4); // Should call f again and return new value (4)
    expect(f).toHaveBeenCalledTimes(2); // f should be called twice now
    expect(f).toHaveBeenCalledWith(3);
  });
});
