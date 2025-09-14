import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import {
  ScriptPlayer,
  type ScriptPlayerEvents,
} from '../../lib/ScriptPlayer/ScriptPlayer.js';
import styles from './Player.module.scss';
import { TimeSeeker } from './TimeSeeker.js';
import { TimeSlider } from './TimeSlider.js';

type PlayerProps = {
  player: ScriptPlayer;
  state: { length: number | null } | null;
};

export const Player = ({ player, state }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastFrame, setLastFrame] = useState(0);

  // Player events
  const handlePlayingChange = useCallback(
    (event: ScriptPlayerEvents['playingChange']) => {
      setIsPlaying(event.detail.playing);
    },
    [],
  );

  const handleFrame = useCallback((event: ScriptPlayerEvents['frame']) => {
    setLastFrame(event.detail.frame);
  }, []);

  useEffect(() => {
    player.addEventListener('playingChange', handlePlayingChange);
    player.addEventListener('frame', handleFrame);

    return () => {
      player.removeEventListener('playingChange', handlePlayingChange);
      player.removeEventListener('frame', handleFrame);
    };
  }, [player, handlePlayingChange, handleFrame]);

  // Controls
  const togglePlay = useCallback(() => {
    void player.togglePlay();
  }, [player]);

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

  // Seeking
  const handleTime = useCallback(
    (time: number) => {
      const frame = time * player.sampleRate;
      void player.setFrame(frame);
      setLastFrame(frame);
    },
    [player],
  );

  const title = `${isPlaying ? 'Pause' : 'Play'} (CTRL-Space)`;

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={togglePlay}
        className={'color-orange'}
        disabled={state === null}
        title={title}
        aria-label={title}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>

      {state === null ? null : state.length !== null ? (
        <TimeSlider
          length={state.length}
          value={lastFrame / player.sampleRate}
          onChange={handleTime}
        />
      ) : (
        <TimeSeeker
          value={lastFrame / player.sampleRate}
          onChange={handleTime}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};
