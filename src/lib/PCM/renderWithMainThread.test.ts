import type { StereoSignal, Time } from '../audio.js';
import { renderPcmBufferStereoWithMainThread } from './renderWithMainThread.js';

// Simple stereo renderer for testing
const testStereoRenderer = (t: Time): StereoSignal => {
  const freq = 440; // A4 note
  const phase = 2 * Math.PI * freq * t;
  const left = Math.sin(phase) * 0.5;
  const right = Math.cos(phase) * 0.5;
  return [left, right];
};

// Stereo renderer that throws an error for testing error handling
const errorStereoRenderer = (_t: Time): StereoSignal => {
  throw new Error('Test error in audio rendering');
};

describe('renderPcmBufferStereoWithMainThread', () => {
  it('renders a simple stereo buffer', () => {
    const result = renderPcmBufferStereoWithMainThread(32, 1, 5, (t) => [
      1 / (t + 1),
      -1 / (t + 1),
    ]);
    expect(result.type).toBe('success');
    const success = result as Extract<typeof result, { type: 'success' }>;
    expect(success.buffer.length).toBe(5 * 2);
    expect(success.buffer).toBeInstanceOf(Float32Array);
    expect(success.buffer[0]).toBeCloseTo(1 / 1);
    expect(success.buffer[1]).toBeCloseTo(-1 / 1);
    expect(success.buffer[2]).toBeCloseTo(1 / 2);
    expect(success.buffer[3]).toBeCloseTo(-1 / 2);
    expect(success.buffer[4]).toBeCloseTo(1 / 3);
    expect(success.buffer[5]).toBeCloseTo(-1 / 3);
    expect(success.buffer[6]).toBeCloseTo(1 / 4);
    expect(success.buffer[7]).toBeCloseTo(-1 / 4);
    expect(success.buffer[8]).toBeCloseTo(1 / 5);
    expect(success.buffer[9]).toBeCloseTo(-1 / 5);
  });

  describe('8bit', () => {
    it('should render stereo audio with 8-bit samples', () => {
      const sampleRate = 44100;
      const length = 0.1; // 100ms
      const result = renderPcmBufferStereoWithMainThread(
        8,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');

      const resultAsSuccess = result as Extract<
        typeof result,
        { type: 'success' }
      >;

      expect(resultAsSuccess.buffer).toBeInstanceOf(Uint8Array);
      expect(resultAsSuccess.buffer.length).toBe(
        2 * Math.floor(length * sampleRate),
      );

      // Check that values are in the correct range for 8-bit
      for (const value of resultAsSuccess.buffer) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereoWithMainThread(
        8,
        44100,
        0.1,
        errorStereoRenderer,
      );
      expect(result.type).toBe('error');

      const resultAsError = result as Extract<typeof result, { type: 'error' }>;

      expect(resultAsError.error.message).toContain(
        'Test error in audio rendering',
      );
    });
  });

  describe('16bit', () => {
    it('should render stereo audio with 16-bit samples', () => {
      const sampleRate = 44100;
      const length = 0.1;
      const result = renderPcmBufferStereoWithMainThread(
        16,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');

      const resultAsSuccess = result as Extract<
        typeof result,
        { type: 'success' }
      >;

      expect(resultAsSuccess.buffer).toBeInstanceOf(Int16Array);
      expect(resultAsSuccess.buffer.length).toBe(
        2 * Math.floor(length * sampleRate),
      );

      // Check that values are in the correct range for 16-bit signed
      for (const value of resultAsSuccess.buffer) {
        expect(value).toBeGreaterThanOrEqual(-32768);
        expect(value).toBeLessThanOrEqual(32767);
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereoWithMainThread(
        16,
        44100,
        0.1,
        errorStereoRenderer,
      );
      expect(result.type).toBe('error');

      const resultAsError = result as Extract<typeof result, { type: 'error' }>;

      expect(resultAsError.error.message).toContain(
        'Test error in audio rendering',
      );
    });
  });

  describe('32bit', () => {
    it('should render stereo audio with 32-bit float samples', () => {
      const sampleRate = 44100;
      const length = 0.1;
      const result = renderPcmBufferStereoWithMainThread(
        32,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');

      const resultAsSuccess = result as Extract<
        typeof result,
        { type: 'success' }
      >;

      expect(resultAsSuccess.buffer).toBeInstanceOf(Float32Array);
      expect(resultAsSuccess.buffer.length).toBe(
        2 * Math.floor(length * sampleRate),
      );

      // Float values should be in the range [-1, 1] for audio
      for (const value of resultAsSuccess.buffer) {
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereoWithMainThread(
        32,
        44100,
        0.1,
        errorStereoRenderer,
      );
      expect(result.type).toBe('error');

      const resultAsError = result as Extract<typeof result, { type: 'error' }>;

      expect(resultAsError.error.message).toContain(
        'Test error in audio rendering',
      );
    });
  });
});
