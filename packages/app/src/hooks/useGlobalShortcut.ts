import { useEffect } from 'react';
import { useLatest } from './useLatest';

export type ShortcutEvent = Pick<
  KeyboardEvent,
  'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey' | 'key'
>;

export function useGlobalShortcut(
  isShortcut: (event: ShortcutEvent) => boolean,
  onShortcut: () => void,
) {
  const latestIsShortcut = useLatest(isShortcut);
  const latestOnShortcut = useLatest(onShortcut);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (latestIsShortcut.current(e)) {
        e.preventDefault();
        latestOnShortcut.current();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [latestIsShortcut, latestOnShortcut]);
}
