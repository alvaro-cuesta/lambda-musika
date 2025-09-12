import { clamp } from '../../utils/math.js';
import type { ExceptionInfo } from '../exception.js';
import type { ScriptPlayerMessage } from '../ScriptPlayer/ScriptPlayer.audioWorklet.js';
import scriptPlayerProcessorAudioWorkletUrl from '../ScriptPlayer/ScriptPlayer.audioWorklet.js?worker&url';
import { initRendering, type BitDepth, type BufferForBitDepth } from './PCM.js';

// @todo renderPcmMonoBuffer

type RenderResult<Bd extends BitDepth> =
  | { type: 'success'; buffer: BufferForBitDepth<Bd> }
  | { type: 'error'; error: ExceptionInfo };

/**
 * Render a stereo PCM audio buffer using a {@link OfflineAudioContext}.
 *
 * @param bitDepth - The bit depth of the audio samples.
 * @param sampleRate - The sample rate of the audio (in Hz)
 * @param length - The length of the audio buffer (in seconds).
 * @param fnCode - The code for a {@link StereoRenderer} function that generates the audio samples.
 * @returns A {@link RenderResult} containing the generated audio buffer, or error information
 */
export async function renderPcmStereoBuffer<Bd extends BitDepth>(
  bitDepth: Bd,
  sampleRate: number,
  length: number,
  fnCode: string,
): Promise<RenderResult<Bd>> {
  const lengthSamples = Math.floor(length * sampleRate);

  // Initialize and connect the offline context and the script player worklet
  const audioCtx = new OfflineAudioContext(2, lengthSamples, sampleRate);
  await audioCtx.audioWorklet.addModule(scriptPlayerProcessorAudioWorkletUrl);
  const audioWorklet = new AudioWorkletNode(audioCtx, 'ScriptPlayerProcessor', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  audioWorklet.connect(audioCtx.destination);

  // Initialize the worklet with the provided function code
  audioWorklet.port.start();

  type InitResult =
    | { type: 'success' }
    | { type: 'error'; error: ExceptionInfo };
  const waitForInit = new Promise<InitResult>((resolve) => {
    audioWorklet.port.addEventListener(
      'message',
      (event: MessageEvent<ScriptPlayerMessage>) => {
        // We don't check requestId here because nobody else can send messages to the worklet
        switch (event.data.type) {
          case 'setFn-success':
            resolve({ type: 'success' as const });
            break;
          case 'setFn-error': {
            resolve({ type: 'error' as const, error: event.data.error });
            break;
          }
        }
      },
    );
  });
  audioWorklet.port.postMessage({
    type: 'setFn',
    fnCode,
    requestId: 'init',
  });

  const initResult = await waitForInit;
  if (initResult.type === 'error') {
    return initResult;
  }

  // Render the audio
  const audioBuffer = await audioCtx.startRendering();
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  // Copy and quantize the audio data into the output buffer
  const { buffer: outBuffer, quantizer } = initRendering(
    bitDepth,
    2 * lengthSamples,
  );

  for (let i = 0; i < lengthSamples; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- ! is fine because we have the same lengthSamples in the buffer and the audioCtx
    outBuffer[i * 2 + 0] = quantizer(clamp(left[i]!, -1, 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- ! is fine because we have the same lengthSamples in the buffer and the audioCtx
    outBuffer[i * 2 + 1] = quantizer(clamp(right[i]!, -1, 1));
  }

  return { type: 'success' as const, buffer: outBuffer };
}
