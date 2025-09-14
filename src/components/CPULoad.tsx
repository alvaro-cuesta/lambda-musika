import { clamp } from '../utils/math.js';
import styles from './CPULoad.module.scss';

export type RenderTiming = {
  ms: number[];
  bufferLength: number;
};

type CPULoadProps = {
  renderTiming: RenderTiming | null;
  sampleRate: number | null;
};

/**
 * Number of render timing history entries to keep. We do this because `process` currently processes blocks of 128
 * samples, which is tiny and produces a lot of noise. By averaging over a longer period we get a more stable reading.
 */
export const TIMING_HISTORY_LENGTH = 64;

/**
 * CPU load visualization. Given a buffer length, and a sample rate, shows how much of the max render time is being
 * used.
 */
export const CPULoad = ({ renderTiming, sampleRate }: CPULoadProps) => {
  let maxRenderTime: number | null = null;
  let totalRenderTime: number | null = null;

  if (
    sampleRate &&
    renderTiming &&
    renderTiming.ms.length >= TIMING_HISTORY_LENGTH
  ) {
    maxRenderTime = Math.floor(
      (TIMING_HISTORY_LENGTH * 1000 * renderTiming.bufferLength) / sampleRate,
    );
    totalRenderTime = renderTiming.ms.reduce((acc, cur) => acc + cur, 0);
  }

  const maxRenderTimeLabel =
    maxRenderTime !== null ? `Max: ${maxRenderTime}ms` : null;

  const percentageUsed = clamp(
    totalRenderTime !== null && maxRenderTime !== null
      ? 100 * (totalRenderTime / maxRenderTime)
      : 0,
    0,
    100,
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.blackOverlay}
        style={{ minWidth: `${100 - percentageUsed}%` }}
      />
      <div className={styles.textOverlay}>
        <span className={styles.text}>
          CPU
          {totalRenderTime != null ? `: ${Math.floor(totalRenderTime)}ms` : ''}
        </span>
        <span className={styles.text}>{maxRenderTimeLabel}</span>
      </div>
    </div>
  );
};
