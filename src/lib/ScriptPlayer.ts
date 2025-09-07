import type { StereoRenderer, Time } from './audio.js';
import { tryParseException, type ExceptionInfo } from './compile.js';

export type OnPlayingChange = (playing: boolean) => void;
export type OnFrame = (frame: number) => void;
export type OnRenderTime = (ms: number) => void;
export type OnError = (error: ExceptionInfo) => void;

export class ScriptPlayer {
  private readonly audioCtx: AudioContext;
  private readonly bufferLength: number;

  private scriptProcessor: ScriptProcessorNode | null;
  private lastFn: StereoRenderer | null;

  public fn: StereoRenderer | null;
  public length: number | null;
  public lastFrame: number;
  public onPlayingChange: OnPlayingChange | undefined;
  public onFrame: OnFrame | undefined;
  public onRenderTime: OnRenderTime | undefined;
  public onError: OnError | undefined;

  constructor(
    audioCtx: AudioContext,
    bufferLength: number,
    fn: StereoRenderer | null,
    length: number | null,
    playing = false,
    lastFrame = 0,
  ) {
    this.audioCtx = audioCtx;
    this.bufferLength = bufferLength;

    this.scriptProcessor = playing ? this.initScriptProcessor() : null;
    this.lastFn = null;

    this.fn = fn;
    this.length = length;
    this.lastFrame = lastFrame;
  }

  /* PUBLIC API */

  public play(): void {
    if (!this.scriptProcessor && this.fn) {
      void this.audioCtx.resume().then(() => {
        this.initScriptProcessor();
        this.onPlayingChange?.(true);
      });
    }
  }

  public pause(): void {
    if (this.scriptProcessor) {
      this.destroyScriptProcessor();
      this.onPlayingChange?.(false);
    }
  }

  public togglePlay(): void {
    if (this.scriptProcessor) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop(): void {
    this.pause();
    this.lastFrame = 0;
    this.onFrame?.(0);
  }

  /* PRIVATE FUNCTIONS */

  private initScriptProcessor(): ScriptProcessorNode {
    const { audioCtx, bufferLength } = this;

    if (this.scriptProcessor) {
      this.destroyScriptProcessor();
    }

    this.scriptProcessor = audioCtx.createScriptProcessor(bufferLength, 0, 2);
    this.scriptProcessor.onaudioprocess = this.handleAudioProcess.bind(this);
    this.scriptProcessor.connect(audioCtx.destination);

    return this.scriptProcessor;
  }

  private destroyScriptProcessor(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect(this.audioCtx.destination);
      this.scriptProcessor = null;
    }
  }

  private handleAudioProcess(audioProcessingEvent: AudioProcessingEvent): void {
    const {
      audioCtx: { sampleRate },
      length,
      onRenderTime,
    } = this;
    let { lastFrame, fn } = this;
    const buffer = audioProcessingEvent.outputBuffer;

    if (!fn) {
      for (let i = 0; i < buffer.length; i++) {
        buffer.getChannelData(0)[i] = 0;
        buffer.getChannelData(1)[i] = 0;
      }
      return;
    }

    const lChannel = buffer.getChannelData(0);
    const rChannel = buffer.getChannelData(1);

    // Fill the buffer and time how long it takes
    let start: number | null = null;
    if (onRenderTime) {
      start = performance.now();
    }
    for (let i = 0; i < buffer.length; i++) {
      const t = ((i + lastFrame) / sampleRate) as Time;
      try {
        const [l, r] = fn(t);
        lChannel[i] = l;
        rChannel[i] = r;
      } catch (e) {
        this.onError?.(tryParseException(e));
        // Try to recover using backup fn
        if (this.lastFn) {
          fn = this.fn = this.lastFn;
          this.lastFn = null;
          i = 0;
          continue;
        }
        // No backup fn, just stop
        else {
          this.pause();
          return;
        }
      }
    }

    // Advance frame
    lastFrame += buffer.length;
    this.onFrame?.(lastFrame);

    // Save this (presumably working) fn as a backup fn
    this.lastFn ??= fn;

    // Continue playing or stop if we've reached the end
    if (length && lastFrame > length * sampleRate) {
      this.stop();
    } else {
      this.lastFrame = lastFrame;
      if (onRenderTime && start !== null) {
        this.onRenderTime?.(performance.now() - start);
      }
    }
  }
}
