import {
  faBackward,
  faFastBackward,
  faForward,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import React from 'react';
import { toMinSecs } from '../../utils/time.js';
import styles from './TimeSeeker.module.scss';

const REWIND_FF_SECS = 5;
const VERY_FF_SECS = 60;

type TimeSeekerProps = {
  value?: number;
  onChange?: (value: number) => void;
};

export const TimeSeeker = ({ value = 0, onChange }: TimeSeekerProps) => {
  const handleRestart = () => {
    onChange?.(0);
  };

  const handleRewind = () => {
    onChange?.(Math.max(0, value - REWIND_FF_SECS));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const [mins, secs] = e.currentTarget.value
        .split(':')
        .map((n) => parseInt(n, 10));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe because input type=time always gives MM:SS
      onChange(mins! * 60 + secs!);
    }
  };

  const handleFastForward = () => {
    onChange?.(value + REWIND_FF_SECS);
  };

  const handleVeryFastForward = () => {
    onChange?.(value + VERY_FF_SECS);
  };

  const restartLabel = 'Restart';
  const rewindLabel = `-${REWIND_FF_SECS} seconds`;
  const timeLabel = 'Time';
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

      <input
        className={cx('color-yellow', styles['input-time'])}
        type="time"
        value={toMinSecs(value)}
        required
        onChange={handleChange}
        title={timeLabel}
        aria-label={timeLabel}
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
