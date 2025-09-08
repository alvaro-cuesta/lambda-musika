import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { TimeSeeker } from './TimeSeeker.js';
import { TimeSlider } from './TimeSlider.js';

import {
  ScriptPlayer,
  type OnError,
  type OnFrame,
  type OnPlayingChange,
  type OnRenderTime,
} from '../../lib/ScriptPlayer/ScriptPlayer.js';

import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Player.module.scss';

export type PlayerRef = {
  pause: () => Promise<void>;
};

type PlayerProps = {
  audioCtx: AudioContext;
  fnCode: string | null;
  length: number | null;
  onPlayingChange?: OnPlayingChange | undefined;
  onRenderTime?: OnRenderTime | undefined;
  onError?: OnError | undefined;
  ref?: React.Ref<PlayerRef> | undefined;
};

type Waitable<T> = {
  get: Promise<T>;
  store: (value: T) => void;
};

function useWaitableRef<T>() {
  const ref = useRef<Waitable<T> | null>(null);
  ref.current ??= (() => {
    let store: (v: T) => void = () => {
      throw new Error('Unexpected uninitialized useWaitableRef.store!');
    };
    const get = new Promise<T>((resolve) => {
      store = resolve;
    });
    return { get, store };
  })();

  return {
    get: ref.current.get,
    store: ref.current.store,
  };
}

export const Player = ({
  audioCtx,
  fnCode,
  length,
  onPlayingChange,
  onRenderTime,
  onError,
  ref,
}: PlayerProps) => {
  const fnPlayerRef = useWaitableRef<ScriptPlayer>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [lastFrame, setLastFrame] = useState(0);

  const makeFnPlayer = useCallback(
    async (
      fnCode: string | null,
      onPlayingChange: OnPlayingChange | undefined,
      onFrame: OnFrame | undefined,
      onRenderTime: OnRenderTime | undefined,
      onError: OnError | undefined,
    ): Promise<ScriptPlayer> => {
      const fnPlayer = await ScriptPlayer.create(audioCtx);
      fnPlayer.onPlayingChange = onPlayingChange;
      fnPlayer.onFrame = onFrame;
      fnPlayer.onRenderTime = onRenderTime;
      fnPlayer.onError = onError;
      await fnPlayer.setFn(fnCode);

      return fnPlayer;
    },
    [audioCtx],
  );

  const handlePlayingChange = useCallback(
    (playing: boolean) => {
      setIsPlaying(playing);
      onPlayingChange?.(playing);
    },
    [onPlayingChange],
  );

  const handleFrame = useCallback((frame: number) => {
    setLastFrame(frame);
  }, []);

  // Sync props with fnPlayer
  useEffect(() => {
    void (async () => {
      fnPlayerRef.store(
        await makeFnPlayer(
          fnCode,
          handlePlayingChange,
          handleFrame,
          onRenderTime,
          onError,
        ),
      );
    })();

    return () => {
      void fnPlayerRef.get.then(async (fnPlayer) => {
        await fnPlayer.destroy();
        // @todo Commented out for the new WaitableRef, but might be needed at some point
        // fnPlayerRef.current = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- @todo
  }, [makeFnPlayer]);

  // @todo isPlaying/length are completely ignored and only for show -- not synced (because we have 2 of those, one
  // here and another one in the AudioWorklet)
  useEffect(() => {
    void fnPlayerRef.get.then((fnPlayer) => fnPlayer.setFn(fnCode));
  }, [fnCode, fnPlayerRef.get]);
  useEffect(() => {
    void fnPlayerRef.get.then((fnPlayer) => {
      fnPlayer.onPlayingChange = handlePlayingChange;
    });
  }, [handlePlayingChange, fnPlayerRef.get]);
  useEffect(() => {
    void fnPlayerRef.get.then((fnPlayer) => {
      fnPlayer.onFrame = handleFrame;
    });
  }, [handleFrame, fnPlayerRef.get]);
  useEffect(() => {
    void fnPlayerRef.get.then((fnPlayer) => {
      fnPlayer.onRenderTime = onRenderTime;
    });
  }, [onRenderTime, fnPlayerRef.get]);
  useEffect(() => {
    void fnPlayerRef.get.then((fnPlayer) => {
      fnPlayer.onError = onError;
    });
  }, [onError, fnPlayerRef.get]);

  // Controls
  const togglePlay = useCallback(() => {
    void fnPlayerRef.get.then((fnPlayer) => fnPlayer.togglePlay());
  }, [fnPlayerRef.get]);

  // @todo Completely remove this
  useImperativeHandle(
    ref,
    () => ({
      async pause() {
        await fnPlayerRef.get.then((fnPlayer) => fnPlayer.pause());
      },
    }),
    [fnPlayerRef.get],
  );

  // CTRL+Space = toggle play/pause
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        e.key === ' '
      ) {
        togglePlay();
      }
    }

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [togglePlay]);

  // Handle seeking from controls
  const handleTime = useCallback(
    (time: number) => {
      const frame = time * audioCtx.sampleRate;
      void fnPlayerRef.get.then((fnPlayer) => fnPlayer.setFrame(frame));
      setLastFrame(frame);
    },
    [audioCtx.sampleRate, fnPlayerRef.get],
  );

  const sampleRate = audioCtx.sampleRate;
  const title = `${isPlaying ? 'Pause' : 'Play'} (CTRL-Space)`;

  return (
    <div className={styles['container']}>
      <button
        type="button"
        onClick={togglePlay}
        className={'color-orange'}
        disabled={fnCode === null}
        title={title}
        aria-label={title}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>

      {fnCode === null ? null : length ? (
        <TimeSlider
          length={length}
          value={lastFrame / sampleRate}
          onChange={handleTime}
        />
      ) : (
        <TimeSeeker
          value={lastFrame / sampleRate}
          onChange={handleTime}
        />
      )}
    </div>
  );
};
