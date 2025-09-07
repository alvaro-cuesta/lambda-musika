import { describe, expect, it } from 'vitest';
import type { StereoRenderer, StereoSignal, Time } from '../audio.js';
import { renderPcmBufferStereoWithWorkers } from './PCM-with-workers.js';

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

function functionToMusikaScript(fn: StereoRenderer): string {
  return `setLength(0.1);
return ${fn.toString()}`;
}

describe('renderPcmBufferStereoWithWorkers', () => {
  // Note: These tests run in a Node.js environment where WebWorkers are not available
  // They will fall back to synchronous rendering which should work identically to the old implementation

  it('should fall back gracefully when workers are not available', async () => {
    const sampleRate = 44100;
    const length = 0.01; // Very short for faster tests

    // Test that functions don't throw errors
    const uint8Promise = renderPcmBufferStereoWithWorkers(
      8,
      sampleRate,
      length,
      functionToMusikaScript(testStereoRenderer),
    );
    const int16Promise = renderPcmBufferStereoWithWorkers(
      16,
      sampleRate,
      length,
      functionToMusikaScript(testStereoRenderer),
    );
    const float32Promise = renderPcmBufferStereoWithWorkers(
      32,
      sampleRate,
      length,
      functionToMusikaScript(testStereoRenderer),
    );

    // Functions should return promises
    expect(uint8Promise).toBeInstanceOf(Promise);
    expect(int16Promise).toBeInstanceOf(Promise);
    expect(float32Promise).toBeInstanceOf(Promise);

    // The promises should resolve (either with success or error, but not throw)
    await expect(uint8Promise).resolves.toMatchObject({
      type: 'success',
    });
    await expect(int16Promise).resolves.toMatchObject({
      type: 'success',
    });
    await expect(float32Promise).resolves.toMatchObject({
      type: 'success',
    });

    // We don't test further here because the synchronous rendering is already tested
  });

  it('should handle errors in the renderer function', async () => {
    const resultPromise = renderPcmBufferStereoWithWorkers(
      8,
      44100,
      0.1,
      functionToMusikaScript(errorStereoRenderer),
    );

    return expect(resultPromise).resolves.toMatchObject({
      type: 'error',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      error: expect.objectContaining({
        message: 'Test error in audio rendering',
      }),
    });
  });
});
