import { clamp } from '../../utils/math.js';
import type { StereoRenderer, Time } from '../audio.js';
import { compile } from '../compile.js';
import { tryParseException, type ExceptionInfo } from '../exception.js';
import './audio-worklet-defs.ts';

export type ScriptPlayerRequest =
  | {
      type: 'setFn';
      requestId: string;
      fnCode: string | null;
    }
  | {
      type: 'setFrame';
      requestId: string;
      frame: number;
    };

type ScriptPlayerResponse =
  | {
      type: 'setFn-success';
      requestId: string;
    }
  | {
      type: 'setFn-error';
      requestId: string;
      error: ExceptionInfo;
    }
  | {
      type: 'setFrame-success';
      requestId: string;
    };

export type ScriptPlayerMessage =
  | ScriptPlayerResponse
  | {
      type: 'process-started';
      frameStart: number;
      bufferLength: number;
    }
  | {
      type: 'process-success';
      frameStart: number;
      bufferLength: number;
      hasFinished: boolean;
    }
  | {
      type: 'process-renderError';
      error: ExceptionInfo;
    };

class ScriptPlayerProcessor extends AudioWorkletProcessor {
  frame: {
    frame: number;
    setAtFrame: number;
  };

  fn: StereoRenderer | null;
  lastKnownWorkingFn: StereoRenderer | null;
  length: number | null;

  constructor(options?: AudioWorkletNodeOptions) {
    if (options !== undefined) {
      if (
        options.numberOfInputs !== undefined &&
        options.numberOfInputs !== 0
      ) {
        throw new TypeError('Inputs are not supported');
      }
      if (
        options.numberOfOutputs !== undefined &&
        options.numberOfOutputs !== 1
      ) {
        throw new TypeError('Multiple outputs are not supported');
      }
      if (
        options.outputChannelCount !== undefined &&
        (options.outputChannelCount.length !== 1 ||
          options.outputChannelCount[0] !== 2)
      ) {
        throw new TypeError('Only stereo output is supported');
      }
    }

    super({
      ...options,
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    this.port.onmessage = this.handleMessage.bind(this);

    this.lastKnownWorkingFn = null;
    this.fn = null;
    this.length = null;
    this.frame = {
      frame: 0,
      setAtFrame: currentFrame,
    };
  }

  /* MESSAGING */

  sendMessage(response: ScriptPlayerMessage): void {
    this.port.postMessage(response);
  }

  handleMessage(event: MessageEvent<ScriptPlayerRequest>): void {
    const message = event.data;

    switch (message.type) {
      case 'setFn': {
        this.handleSetFn(message.requestId, message.fnCode);
        break;
      }
      case 'setFrame': {
        this.handleSetFrame(message.requestId, message.frame);
        break;
      }
    }
  }

  handleSetFn(requestId: string, fnCode: string | null): void {
    if (fnCode === null) {
      this.fn = null;
      this.length = null;
      this.sendMessage({
        type: 'setFn-success',
        requestId,
      });
      return;
    }

    const compileResult = compile(fnCode, sampleRate);

    switch (compileResult.type) {
      case 'error': {
        this.sendMessage({
          type: 'setFn-error',
          requestId,
          error: compileResult.error,
        });
        return;
      }
      case 'success': {
        this.fn = compileResult.fn;
        this.length = compileResult.length;
        this.sendMessage({
          type: 'setFn-success',
          requestId,
        });
        return;
      }
    }
  }

  handleSetFrame(requestId: string, frame: number): void {
    frame = clamp(
      frame,
      0,
      this.length ? this.length * sampleRate : Number.MAX_SAFE_INTEGER,
    );

    this.frame = {
      frame,
      setAtFrame: currentFrame,
    };

    this.sendMessage({
      type: 'setFrame-success',
      requestId,
    });
  }

  /* AUDIO PROCESSING */

  get currentFrame(): number {
    return this.frame.frame + (currentFrame - this.frame.setAtFrame);
  }

  // The type signature here is important - we must have exactly 2 outputs (L and R) -- this was forced in constructor
  // We always return `true` here even if we presumably won't process because I'm not sure if we can easily restart a
  // worklet that returned `false` once and was cleaned up by the audio system
  process(_inputs: [], [output]: [[Float32Array, Float32Array]]) {
    if (!this.fn) return true;

    // Here we assume all input, output, and parameter buffers are of the same length (bufferLength)
    const bufferLength = output[0].length;
    if (!bufferLength) return true;

    this.sendMessage({
      type: 'process-started',
      frameStart: this.currentFrame,
      bufferLength,
    });

    const currentFrame = this.currentFrame;

    for (let i = 0; i < bufferLength; i++) {
      const t = ((i + currentFrame) / sampleRate) as Time;
      try {
        const [l, r] = this.fn(t);
        output[0][i] = clamp(l, -1, 1);
        output[1][i] = clamp(r, -1, 1);
      } catch (e) {
        this.sendMessage({
          type: 'process-renderError',
          error: tryParseException(e),
        });

        // Try to recover using backup fn
        if (this.lastKnownWorkingFn) {
          this.fn = this.lastKnownWorkingFn;
          // Reset last known working function so we don't get stuck in a loop
          // This will be saved again once we successfully complete a process call
          this.lastKnownWorkingFn = null;
          // And restart processing from the beginning of this buffer with the working fn
          i = 0;
          continue;
        }
        // No backup fn, just stop
        else {
          return true;
        }
      }
    }

    // Save this (presumably working) fn as a backup fn
    this.lastKnownWorkingFn = this.fn;

    const hasFinished =
      this.length === null
        ? false
        : currentFrame + bufferLength >= this.length * sampleRate;

    this.sendMessage({
      type: 'process-success',
      frameStart: currentFrame,
      bufferLength,
      hasFinished,
    });

    return true;
  }
}

// @todo currently this ignores the audio context's time and just continues where it left off, whereas we might actually want to make the current frame be tied to the audio context's time instead (so it continues properly) -- note this also ties with pause etc.

registerProcessor('ScriptPlayerProcessor', ScriptPlayerProcessor);
