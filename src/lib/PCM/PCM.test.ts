import { makeWavBlob } from './PCM.js';

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
