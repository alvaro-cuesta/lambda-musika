import {
  faBackward,
  faFastBackward,
  faForward,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback } from 'react';
import { TimeInput } from '../TimeInput';
import styles from './TimeSeeker.module.scss';

const REWIND_FF_SECS = 5;
const VERY_FF_SECS = 60;

type TimeSeekerProps = {
  value: number;
  onChange?: (value: number) => void;
  isPlaying?: boolean;
};

export const TimeSeeker = ({
  value = 0,
  onChange,
  isPlaying,
}: TimeSeekerProps) => {
  const handleRestart = useCallback(() => {
    onChange?.(0);
  }, [onChange]);

  const handleRewind = useCallback(() => {
    onChange?.(Math.max(0, value - REWIND_FF_SECS));
  }, [onChange, value]);

  const handleFastForward = useCallback(() => {
    onChange?.(value + REWIND_FF_SECS);
  }, [onChange, value]);

  const handleVeryFastForward = useCallback(() => {
    onChange?.(value + VERY_FF_SECS);
  }, [onChange, value]);

  const restartLabel = 'Restart';
  const rewindLabel = `-${REWIND_FF_SECS} seconds`;
  const forwardLabel = `+${REWIND_FF_SECS} seconds`;
  const fastForwardLabel = `+${VERY_FF_SECS} seconds`;

  return (
    <div className={styles['container']}>
      <button
        type="button"
        className="color-purple"
        onClick={handleRestart}
        title={restartLabel}
        aria-label={restartLabel}
      >
        <FontAwesomeIcon icon={faFastBackward} />
      </button>

      <button
        type="button"
        className="color-green"
        onClick={handleRewind}
        title={rewindLabel}
        aria-label={rewindLabel}
      >
        <FontAwesomeIcon icon={faBackward} />
      </button>

      <TimeInput
        value={value}
        onChange={onChange}
        isTicking={isPlaying}
      />

      <button
        type="button"
        className="color-blue"
        onClick={handleFastForward}
        title={forwardLabel}
        aria-label={forwardLabel}
      >
        <FontAwesomeIcon icon={faForward} />
      </button>

      <button
        type="button"
        className="color-red"
        onClick={handleVeryFastForward}
        title={fastForwardLabel}
        aria-label={fastForwardLabel}
      >
        <span className="fa-layers">
          <FontAwesomeIcon
            icon={faForward}
            transform={{ x: -4 }}
          />
          <FontAwesomeIcon
            icon={faForward}
            transform={{ x: 4 }}
          />
        </span>
      </button>
    </div>
  );
};
