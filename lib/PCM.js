import { tryParseException } from 'compile'

/* PCM WAV generation */

export function makeWAVURL(data, numChannels, sampleRate, littleEndian = true) {
  let bytesPerSample = data.BYTES_PER_ELEMENT;
  let samplesPerChannel = data.length/numChannels;

  let blockAlign = numChannels * bytesPerSample;
  let byteRate = sampleRate * blockAlign;
  let dataSize = samplesPerChannel * blockAlign;

  let header = new ArrayBuffer(44);            // Header length
  let dv = new DataView(header);

  let chunkID = (littleEndian) ?
    0x52494646 :  // 'RIFF'
    0x52494658 ;  // 'RIFX'

  dv.setUint32(0, chunkID, false);             // ChunkID
  dv.setUint32(4, dataSize + 36, true);        // ChunkSize
  dv.setUint32(8, 0x57415645, false);          // Format ('WAVE')
  dv.setUint32(12, 0x666d7420, false);         // Subchunk1ID ('fmt ')
  dv.setUint32(16, 16, true);                  // Subchunk1Size
  dv.setUint16(20, 1, true);                   // AudioFormat (1 = PCM)
  dv.setUint16(22, numChannels, true);         // NumChannels
  dv.setUint32(24, sampleRate, true);          // SampleRate
  dv.setUint32(28, byteRate, true);            // ByteRate
  dv.setUint16(32, blockAlign, true);          // BlockAlign
  dv.setUint16(34, bytesPerSample * 8, true);  // BitsPerSample
  dv.setUint32(36, 0x64617461, false);         // Subchunk2ID ('data')
  dv.setUint32(40, dataSize, true);            // Subchunk2Size

  let blob = new Blob([header, data], {type: 'audio/wav'});
  return URL.createObjectURL(blob);
}

function quantizeUint8(v) {
  return Math.floor((v + 1) / 2 * 0xff);
}

export function quantizeInt16(v) {
 return Math.floor((v + 1) / 2 * 0xffff - 0x8000);
}

export function Uint8Mono(sampleRate, length, fn) {
  let channelLength = Math.floor(length * sampleRate);
  let buffer = new Uint8Array(channelLength);

  for (let i = 0; i < buffer.length; i++) {
    let t = i/sampleRate;
    let y;
    try {
      y = fn(t);
    } catch (e) {
      return {error: tryParseException(e)};
    }
    buffer[i] = quantizeUint8(y);
  }

  return {buffer};
}

export function Uint8Stereo(sampleRate, length, fn) {
  let channelLength = Math.floor(length * sampleRate);
  let buffer = new Uint8Array(2 * channelLength);

  for (let i = 0; i < channelLength; i++) {
    let t = i/sampleRate;
    let l, r;
    try {
      [l, r] = fn(t);
    } catch (e) {
      return {error: tryParseException(e)};
    }
    buffer[i * 2] = quantizeUint8(l);
    buffer[i * 2 + 1] = quantizeUint8(r);
  }

  return {buffer};
}

export function Int16Mono(sampleRate, length, fn) {
  let channelLength = Math.floor(length * sampleRate);
  let buffer = new Int16Array(channelLength);

  for (let i = 0; i < channelLength; i++) {
    let t = i/sampleRate;
    let y;
    try {
      y = fn(t);
    } catch (e) {
      return {error: tryParseException(e)};
    }
    buffer[i] = quantizeInt16(y);
  }

  return {buffer};
}

export function Int16Stereo(sampleRate, length, fn) {
  let channelLength = Math.floor(length * sampleRate);
  let buffer = new Int16Array(2 * channelLength);

  for (let i = 0; i < channelLength; i++) {
    let t = i/sampleRate;
    let l, r;
    try {
      [l, r] = fn(t);
    } catch (e) {
      return {error: tryParseException(e)};
    }
    buffer[i * 2] = quantizeInt16(l);
    buffer[i * 2 + 1] = quantizeInt16(r);
  }

  return {buffer};
}
