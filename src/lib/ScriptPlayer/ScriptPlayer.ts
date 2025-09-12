import { TypedEventTarget, type TypedEventMap } from '../../utils/events.js';
import { getRandomId } from '../../utils/random.js';
import { type ExceptionInfo } from '../exception.js';
import type {
  ScriptPlayerMessage,
  ScriptPlayerRequest,
} from './ScriptPlayer.audioWorklet.js';
import scriptPlayerProcessorAudioWorkletUrl from './ScriptPlayer.audioWorklet.js?worker&url';

type ScriptPlayerEventMap = {
  playingChange: { playing: boolean };
  frame: { frame: number };
  renderTime: { ms: number; bufferLength: number };
  error: { error: ExceptionInfo };
};

export type ScriptPlayerEvents = TypedEventMap<ScriptPlayerEventMap>;

export class ScriptPlayer extends TypedEventTarget<ScriptPlayerEventMap> {
  private readonly audioCtx: AudioContext;
  private readonly audioWorklet: AudioWorkletNode;

  private lastProcessStart: number | null = null;

  private constructor(audioCtx: AudioContext) {
    super();

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
  public get sampleRate(): number {
    return this.audioCtx.sampleRate;
  }

  public static async create(audioCtx: AudioContext): Promise<ScriptPlayer> {
    await audioCtx.audioWorklet.addModule(scriptPlayerProcessorAudioWorkletUrl);
    return new ScriptPlayer(audioCtx);
  }

  public async play(): Promise<void> {
    await this.audioCtx.resume();
    this.dispatchEvent('playingChange', { playing: true });
  }

  public async pause(): Promise<void> {
    await this.audioCtx.suspend();
    this.dispatchEvent('playingChange', { playing: false });
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
    this.dispatchEvent('frame', { frame: 0 });
  }

  public async destroy(): Promise<void> {
    await this.stop();
    this.audioWorklet.disconnect();
    this.audioWorklet.port.close();
    // Note: We do not close the AudioContext because it may be shared with other parts of the app

    // @todo do we have to remove player event listeners?
    // @todo do we have to remove worklet event listeners or is closing the port enough?
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
            this.dispatchEvent('frame', { frame });
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
        const currentFrame = message.frameStart + message.bufferLength;
        this.dispatchEvent('frame', { frame: currentFrame });
        if (this.lastProcessStart !== null) {
          // @todo This is actually wrong right now: performance.now() does not exist inside the worklet, so we had to
          // resort to this hacky way of measuring time, but there's a lot of noise introduced by marshalling of
          // messages, the event loop running, the main thread running other stuff, etc.
          // We need a better way of measuring this but I don't think it exists right now.
          this.dispatchEvent('renderTime', {
            ms: performance.now() - this.lastProcessStart,
            bufferLength: message.bufferLength,
          });
        }
        if (message.hasFinished) {
          void this.stop();
        }
        break;
      }
      case 'process-renderError': {
        this.dispatchEvent('error', { error: message.error });
        break;
      }
      default: {
        return;
      }
    }
  }
}
