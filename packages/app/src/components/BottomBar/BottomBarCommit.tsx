/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useGlobalShortcut,
  type ShortcutEvent,
} from '../../hooks/useGlobalShortcut.js';

function isCommitShortcut(event: ShortcutEvent): boolean {
  return (
    event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey &&
    event.key === 's'
  );
}

type BottomBarCommitProps = {
  onCommit(): void;
};

export function BottomBarCommit({ onCommit }: BottomBarCommitProps) {
  useGlobalShortcut(isCommitShortcut, onCommit);

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
