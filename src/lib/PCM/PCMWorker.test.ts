import { describe, expect, it } from 'vitest';
import type { StereoRenderer } from '../audio.js';
import { renderPcmBufferStereo } from './PCM.js';
import {
  Float32StereoWorker,
  Int16StereoWorker,
  Uint8StereoWorker,
} from './PCMWorker.js';

// Simple stereo renderer for testing
const testStereoRenderer: StereoRenderer = (t: number) => {
  const freq = 440; // A4 note
  const phase = 2 * Math.PI * freq * t;
  const left = Math.sin(phase) * 0.5;
  const right = Math.cos(phase) * 0.5;
  return [left, right];
};

// Stereo renderer that throws an error for testing error handling
const errorStereoRenderer: StereoRenderer = () => {
  throw new Error('Test error in audio rendering');
};

describe('PCM (Original Implementation)', () => {
  describe('Uint8Stereo', () => {
    it('should render stereo audio with 8-bit samples', () => {
      const sampleRate = 44100;
      const length = 0.1; // 100ms
      const result = renderPcmBufferStereo(
        8,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.buffer).toBeInstanceOf(Uint8Array);
        expect(result.buffer.length).toBe(2 * Math.floor(length * sampleRate));

        // Check that values are in the correct range for 8-bit
        for (const value of result.buffer) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(255);
        }
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereo(8, 44100, 0.1, errorStereoRenderer);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Test error in audio rendering');
      }
    });
  });

  describe('Int16Stereo', () => {
    it('should render stereo audio with 16-bit samples', () => {
      const sampleRate = 44100;
      const length = 0.1;
      const result = renderPcmBufferStereo(
        16,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.buffer).toBeInstanceOf(Int16Array);
        expect(result.buffer.length).toBe(2 * Math.floor(length * sampleRate));

        // Check that values are in the correct range for 16-bit signed
        for (const value of result.buffer) {
          expect(value).toBeGreaterThanOrEqual(-32768);
          expect(value).toBeLessThanOrEqual(32767);
        }
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereo(16, 44100, 0.1, errorStereoRenderer);
      expect(result.type).toBe('error');
    });
  });

  describe('Float32Stereo', () => {
    it('should render stereo audio with 32-bit float samples', () => {
      const sampleRate = 44100;
      const length = 0.1;
      const result = renderPcmBufferStereo(
        32,
        sampleRate,
        length,
        testStereoRenderer,
      );

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.buffer).toBeInstanceOf(Float32Array);
        expect(result.buffer.length).toBe(2 * Math.floor(length * sampleRate));

        // Float values should be in the range [-1, 1] for audio
        for (const value of result.buffer) {
          expect(value).toBeGreaterThanOrEqual(-1);
          expect(value).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should handle errors in the renderer function', () => {
      const result = renderPcmBufferStereo(32, 44100, 0.1, errorStereoRenderer);
      expect(result.type).toBe('error');
    });
  });
});

describe('PCMWorker (New Worker Implementation)', () => {
  // Note: These tests run in a Node.js environment where WebWorkers are not available
  // They will fall back to synchronous rendering which should work identically to the old implementation

  describe('Module exports', () => {
    it('should export worker functions', () => {
      expect(typeof Uint8StereoWorker).toBe('function');
      expect(typeof Int16StereoWorker).toBe('function');
      expect(typeof Float32StereoWorker).toBe('function');
    });
  });

  describe('Fallback behavior in test environment', () => {
    it('should fall back gracefully when workers are not available', async () => {
      // In the test environment, workers are not available, so it should fall back
      const sampleRate = 44100;
      const length = 0.01; // Very short for faster tests

      // Test that functions don't throw errors
      const uint8Promise = Uint8StereoWorker(
        sampleRate,
        length,
        testStereoRenderer,
      );
      const int16Promise = Int16StereoWorker(
        sampleRate,
        length,
        testStereoRenderer,
      );
      const float32Promise = Float32StereoWorker(
        sampleRate,
        length,
        testStereoRenderer,
      );

      // Functions should return promises
      expect(uint8Promise).toBeInstanceOf(Promise);
      expect(int16Promise).toBeInstanceOf(Promise);
      expect(float32Promise).toBeInstanceOf(Promise);

      // The promises should resolve (either with success or error, but not throw)
      await expect(uint8Promise).resolves.toBeDefined();
      await expect(int16Promise).resolves.toBeDefined();
      await expect(float32Promise).resolves.toBeDefined();
    });
  });
});
