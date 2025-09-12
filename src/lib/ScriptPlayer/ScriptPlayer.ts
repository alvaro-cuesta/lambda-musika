import { getRandomId } from '../../utils/random.js';
import { type ExceptionInfo } from '../exception.js';
import type {
  ScriptPlayerMessage,
  ScriptPlayerRequest,
} from './ScriptPlayer.audioWorklet.js';
import scriptPlayerProcessorAudioWorkletUrl from './ScriptPlayer.audioWorklet.js?worker&url';

export type OnPlayingChange = (playing: boolean) => void;
export type OnFrame = (frame: number) => void;
export type OnRenderTime = (ms: number, bufferLength: number) => void;
export type OnError = (error: ExceptionInfo) => void;

export class ScriptPlayer {
  private readonly audioCtx: AudioContext;
  private readonly audioWorklet: AudioWorkletNode;

  private lastProcessStart: number | null = null;

  public onPlayingChange: OnPlayingChange | undefined;
  public onFrame: OnFrame | undefined;
  public onRenderTime: OnRenderTime | undefined;
  public onError: OnError | undefined;

  private constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.audioWorklet = new AudioWorkletNode(
      this.audioCtx,
      'ScriptPlayerProcessor',
      {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      },
    );
    this.audioWorklet.port.addEventListener(
      'message',
      this.handleMessage.bind(this),
    );
    this.audioWorklet.port.start();
    this.audioWorklet.connect(this.audioCtx.destination);
  }

  /* PUBLIC API */
  public static async create(audioCtx: AudioContext): Promise<ScriptPlayer> {
    await audioCtx.audioWorklet.addModule(scriptPlayerProcessorAudioWorkletUrl);
    return new ScriptPlayer(audioCtx);
  }

  public async play(): Promise<void> {
    await this.audioCtx.resume();
    this.onPlayingChange?.(true);
  }

  public async pause(): Promise<void> {
    await this.audioCtx.suspend();
    this.onPlayingChange?.(false);
  }

  public async togglePlay(): Promise<void> {
    if (this.audioCtx.state === 'running') {
      await this.pause();
    } else {
      await this.play();
    }
  }

  public async stop(): Promise<void> {
    await this.pause();
    await this.setFrame(0);
    this.onFrame?.(0);
    this.onPlayingChange?.(false);
  }

  public async destroy(): Promise<void> {
    await this.stop();
    this.audioWorklet.disconnect();
    this.audioWorklet.port.close();
    // Note: We do not close the AudioContext because it may be shared with other parts of the app
    this.onPlayingChange = undefined;
    this.onFrame = undefined;
    this.onRenderTime = undefined;
    this.onError = undefined;

    // @todo do we have to remove event listeners or is closing the port enough?
    // @todo we might want to add a "destroyed" state and make other methods no-ops after destroy
  }

  public setFn(fnCode: string | null): Promise<
    | {
        type: 'success';
      }
    | {
        type: 'error';
        error: ExceptionInfo;
      }
  > {
    const requestId = getRandomId();

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<ScriptPlayerMessage>) => {
        const message = event.data;

        switch (message.type) {
          case 'setFn-success': {
            if (message.requestId !== requestId) return;
            this.audioWorklet.port.removeEventListener(
              'message',
              handleMessage,
            );
            resolve({ type: 'success' });
            return;
          }
          case 'setFn-error': {
            if (message.requestId !== requestId) return;
            this.audioWorklet.port.removeEventListener(
              'message',
              handleMessage,
            );
            resolve({ type: 'error', error: message.error });
            return;
          }
          default: {
            return;
          }
        }
      };

      this.audioWorklet.port.addEventListener('message', handleMessage);

      this.sendMessage({ type: 'setFn', requestId, fnCode });
    });
  }

  public async setFrame(frame: number): Promise<void> {
    const requestId = getRandomId();

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<ScriptPlayerMessage>) => {
        const message = event.data;

        switch (message.type) {
          case 'setFrame-success': {
            if (message.requestId !== requestId) return;
            this.audioWorklet.port.removeEventListener(
              'message',
              handleMessage,
            );
            this.onFrame?.(frame);
            resolve();
            return;
          }
          default: {
            return;
          }
        }
      };

      this.audioWorklet.port.addEventListener('message', handleMessage);

      this.sendMessage({ type: 'setFrame', requestId, frame });
    });
  }

  /* PRIVATE FUNCTIONS */
  private sendMessage(message: ScriptPlayerRequest): void {
    this.audioWorklet.port.postMessage(message);
  }

  private handleMessage(event: MessageEvent<ScriptPlayerMessage>): void {
    const message = event.data;

    switch (message.type) {
      case 'process-started': {
        this.lastProcessStart = performance.now();
        break;
      }
      case 'process-success': {
        const currentFrame = message.frameStart + message.bufferSize;
        this.onFrame?.(currentFrame);
        if (this.lastProcessStart !== null && this.onRenderTime) {
          // @todo This is actually wrong right now: performance.now() does not exist inside the worklet, so we had to
          // resort to this hacky way of measuring time, but there's a lot of noise introduced by marshalling of
          // messages, the event loop running, the main thread running other stuff, etc.
          // We need a better way of measuring this but I don't think it exists right now.
          this.onRenderTime(
            performance.now() - this.lastProcessStart,
            message.bufferSize,
          );
        }
        if (message.hasFinished) {
          void this.stop();
        }
        break;
      }
      case 'process-renderError': {
        this.onError?.(message.error);
        break;
      }
      default: {
        return;
      }
    }
  }
}
