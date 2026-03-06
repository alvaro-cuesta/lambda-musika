/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

type BottomBarCommitProps = {
  onCommit(): void;
};

export function BottomBarCommit({ onCommit }: BottomBarCommitProps) {
  // CTRL+S = commit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        e.key === 's'
      ) {
        e.preventDefault();
        onCommit();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCommit]);

  return (
    <button
      type="button"
      onClick={onCommit}
      title="CTRL-S"
      aria-label="Commit (CTRL-S)"
    >
      <FontAwesomeIcon icon={faShare} />
      Commit
    </button>
  );
}
