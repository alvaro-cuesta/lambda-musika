/**
 * @module
 * Type definitions for AudioWorkletProcessor and related interfaces. These are mising for some reason in TS's built-in
 * DOM types.
 *
 * Taken from:
 * - https://github.com/microsoft/TypeScript/issues/28308#issuecomment-1921865859
 * - https://github.com/microsoft/TypeScript/issues/28308#issuecomment-1935417258
 *
 * This is not a global `.d.ts` file because we only want these types to be available in AudioWorklet contexts, not
 * in the main thread, so we import this file where needed.
 *
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope)
 */

/* eslint-disable @typescript-eslint/consistent-type-definitions -- be consistent with DOM types */

declare global {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletProcessor) */
  interface AudioWorkletProcessor {
    readonly port: MessagePort;
  }

  interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
    process(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      parameters: Record<string, Float32Array>,
    ): boolean;
  }

  var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
  };

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParamDescriptor) */
  type AudioParamDescriptor = {
    name: string;
    automationRate?: AutomationRate;
    minValue?: number;
    maxValue?: number;
    defaultValue?: number;
  };

  interface AudioWorkletProcessorConstructor {
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessorImpl;
    parameterDescriptors?: AudioParamDescriptor[];
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/registerProcessor) */
  function registerProcessor(
    name: string,
    processorCtor: AudioWorkletProcessorConstructor,
  ): void;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/currentFrame) */
  var currentFrame: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/currentTime) */
  var currentTime: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/sampleRate) */
  var sampleRate: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/registerProcessor) */
}
