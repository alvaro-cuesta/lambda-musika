import { useEffect, useRef, type RefObject } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: ((event: MouseEvent) => void) | null | undefined,
  eventType: 'click' | 'mousedown' = 'click',
) {
  const latestRef = useRef(ref);
  latestRef.current = ref;

  useEffect(() => {
    if (!callback) return;

    function handler(event: MouseEvent) {
      if (
        callback &&
        latestRef.current.current &&
        !latestRef.current.current.contains(event.target as Node)
      ) {
        callback(event);
      }
    }

    document.addEventListener(eventType, handler);

    return () => {
      document.removeEventListener(eventType, handler);
    };
  }, [callback, eventType]);
}
