import styles from './CPULoad.module.scss';

type CPULoadProps = {
  renderTime: number | null;
  bufferLength: number | null;
  sampleRate: number | null;
};

// CPU load visualization. Given a buffer length, and a sample rate, shows how
// much of the max render time is being used.
export const CPULoad = ({
  renderTime,
  bufferLength,
  sampleRate,
}: CPULoadProps) => {
  let maxRenderTimeLabel = '';
  let percentage = 0;

  if (sampleRate && bufferLength) {
    const maxRenderTime = Math.floor((1000 * bufferLength) / sampleRate);
    maxRenderTimeLabel = `Max: ${maxRenderTime}ms`;
    percentage = renderTime ? (100 * renderTime) / maxRenderTime : 0;
  }

  return (
    <div className={styles['container']}>
      <div
        className={styles['black']}
        style={{ minWidth: `${100 - percentage}%` }}
      />
      <div className={styles['overlay']}>
        <span className={styles['text']}>
          CPU{renderTime ? `: ${Math.floor(renderTime)}ms` : ''}
        </span>
        <span className={styles['text']}>{maxRenderTimeLabel}</span>
      </div>
    </div>
  );
};
