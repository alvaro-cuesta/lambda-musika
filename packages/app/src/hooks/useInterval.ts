import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null);
  savedCallback.current = callback;

  useEffect(() => {
    if (delay === null) return;

    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    const id = setInterval(tick, delay);
    return () => {
      clearInterval(id);
    };
  }, [delay]);
}
