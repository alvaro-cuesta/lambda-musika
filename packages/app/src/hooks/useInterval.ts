import { useEffect } from 'react';
import { useLatest } from './useLatest';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) return;

    function tick() {
      savedCallback.current();
    }

    const id = setInterval(tick, delay);
    return () => {
      clearInterval(id);
    };
  }, [savedCallback, delay]);
}
