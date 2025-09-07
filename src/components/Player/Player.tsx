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
  ScriptProcessorPlayer,
  type OnError,
  type OnFrame,
  type OnPlayingChange,
  type OnRenderTime,
} from '../../lib/ScriptProcessorPlayer.js';
import type { StereoRenderer } from '../../lib/audio.js';
import type { ExceptionInfo } from '../../lib/compile.js';

import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Player.module.scss';

export type PlayerRef = {
  pause: () => void;
};

type PlayerProps = {
  audioCtx: AudioContext;
  bufferLength: number;
  fn: StereoRenderer | null;
  length: number | null;
  onPlayingChange?: ((playing: boolean) => void) | undefined;
  onRenderTime?: ((time: number) => void) | undefined;
  onError?: ((error: ExceptionInfo) => void) | undefined;
  ref?: React.Ref<PlayerRef> | undefined;
};

export const Player = ({
  audioCtx,
  fn,
  length,
  bufferLength,
  onPlayingChange,
  onRenderTime,
  onError,
  ref,
}: PlayerProps) => {
  const fnPlayerRef = useRef<ScriptProcessorPlayer>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [lastFrame, setLastFrame] = useState(0);

  const makeFnPlayer = useCallback(
    (
      fn: StereoRenderer | null,
      length: number | null,
      isPlaying: boolean,
      frame: number,
      onPlayingChange: OnPlayingChange,
      onFrame: OnFrame,
      onRenderTime: OnRenderTime | undefined,
      onError: OnError | undefined,
    ) => {
      const fnPlayer = new ScriptProcessorPlayer(
        audioCtx,
        bufferLength,
        fn,
        length,
        isPlaying,
        frame,
      );
      fnPlayer.onPlayingChange = onPlayingChange;
      fnPlayer.onFrame = onFrame;
      fnPlayer.onRenderTime = onRenderTime;
      fnPlayer.onError = onError;
      return fnPlayer;
    },
    [audioCtx, bufferLength],
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
    fnPlayerRef.current = makeFnPlayer(
      fn,
      length,
      isPlaying,
      lastFrame,
      handlePlayingChange,
      handleFrame,
      onRenderTime,
      onError,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- @todo
  }, [makeFnPlayer]);
  // @todo isPlaying is completely ignored and only for show -- not synced
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.fn = fn;
    }
  }, [fn]);
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.length = length;
    }
  }, [length]);
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.onPlayingChange = handlePlayingChange;
    }
  }, [handlePlayingChange]);
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.onFrame = handleFrame;
    }
  }, [handleFrame]);
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.onRenderTime = onRenderTime;
    }
  }, [onRenderTime]);
  useEffect(() => {
    if (fnPlayerRef.current) {
      fnPlayerRef.current.onError = onError;
    }
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fnPlayerRef.current) {
        fnPlayerRef.current.onPlayingChange = undefined;
        fnPlayerRef.current.onFrame = undefined;
        fnPlayerRef.current.onRenderTime = undefined;
        fnPlayerRef.current.onError = undefined;
        fnPlayerRef.current.stop();
      }
    };
  }, []);

  // Controls
  const togglePlay = useCallback(() => {
    fnPlayerRef.current?.togglePlay();
  }, []);

  // @todo Completely remove this
  useImperativeHandle(
    ref,
    () => ({
      pause: () => {
        fnPlayerRef.current?.pause();
      },
    }),
    [],
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
      if (fnPlayerRef.current) {
        fnPlayerRef.current.lastFrame = frame;
      }
      setLastFrame(frame);
    },
    [audioCtx.sampleRate],
  );

  const sampleRate = audioCtx.sampleRate;
  const title = `${isPlaying ? 'Pause' : 'Play'} (CTRL-Space)`;

  return (
    <div className={styles['container']}>
      <button
        type="button"
        onClick={togglePlay}
        className={'color-orange'}
        disabled={!fn}
        title={title}
        aria-label={title}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>

      {!fn ? null : length ? (
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
