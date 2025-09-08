import type { StereoSignal, Time } from '../audio.js';
import { makeWavBlob, renderPcmBufferStereo } from './PCM.js';

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

describe('renderPcmBufferStereo', () => {
  it('renders a simple stereo buffer', () => {
    const result = renderPcmBufferStereo(32, 1, 5, (t) => [
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
      const result = renderPcmBufferStereo(
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
      const result = renderPcmBufferStereo(8, 44100, 0.1, errorStereoRenderer);
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
      const result = renderPcmBufferStereo(
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
      const result = renderPcmBufferStereo(16, 44100, 0.1, errorStereoRenderer);
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
      const result = renderPcmBufferStereo(
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
      const result = renderPcmBufferStereo(32, 44100, 0.1, errorStereoRenderer);
      expect(result.type).toBe('error');

      const resultAsError = result as Extract<typeof result, { type: 'error' }>;

      expect(resultAsError.error.message).toContain(
        'Test error in audio rendering',
      );
    });
  });
});

describe('makeWavBlob', () => {
  it('makes a simple wav blob', async () => {
    const inputBuffer = new Float32Array([-1, -0.5, 0.5, 1]);
    const numChannels = 2;
    const sampleRate = 44100;
    const blockAlign = (numChannels * inputBuffer.BYTES_PER_ELEMENT) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = inputBuffer.length * blockAlign;

    const blob = makeWavBlob([inputBuffer], numChannels, sampleRate);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(
      44 + inputBuffer.length * inputBuffer.BYTES_PER_ELEMENT,
    );
    expect(blob).toBeInstanceOf(Blob);

    const buffer = await blob.arrayBuffer();
    expect(buffer).toEqual(
      new Uint8Array([
        // 'RIFF'
        0x52,
        0x49,
        0x46,
        0x46,
        // ChunkSize (data size + 36)
        inputBuffer.length * inputBuffer.BYTES_PER_ELEMENT + 36,
        0,
        0,
        0,
        // 'WAVE'
        0x57,
        0x41,
        0x56,
        0x45,
        // 'fmt '
        0x66,
        0x6d,
        0x74,
        0x20,
        // Subchunk1Size (16 for PCM)
        16,
        0,
        0,
        0,
        // AudioFormat (3 for 32-bit float)
        3,
        0,
        // NumChannels (2 channels)
        2,
        0,
        // SampleRate (44100)
        (sampleRate & 0x000000ff) >> 0,
        (sampleRate & 0x0000ff00) >> 8,
        (sampleRate & 0x00ff0000) >> 16,
        (sampleRate & 0xff000000) >> 24,
        // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
        (byteRate & 0x000000ff) >> 0,
        (byteRate & 0x0000ff00) >> 8,
        (byteRate & 0x00ff0000) >> 16,
        (byteRate & 0xff000000) >> 24,
        // BlockAlign (NumChannels * BitsPerSample/8)
        (blockAlign & 0x000000ff) >> 0,
        (blockAlign & 0x0000ff00) >> 8,
        // BitsPerSample (32 bits)
        ((inputBuffer.BYTES_PER_ELEMENT * 8) & 0x00ff) >> 0,
        ((inputBuffer.BYTES_PER_ELEMENT * 8) & 0xff00) >> 8,
        // 'data'
        0x64,
        0x61,
        0x74,
        0x61,
        // Subchunk2Size (NumSamples * NumChannels * BitsPerSample/8)
        (dataSize & 0x000000ff) >> 0,
        (dataSize & 0x0000ff00) >> 8,
        (dataSize & 0x00ff0000) >> 16,
        (dataSize & 0xff000000) >> 24,
        // Sample data
        ...Array.from(new Uint8Array(inputBuffer.buffer)),
      ]).buffer,
    );
  });
});
