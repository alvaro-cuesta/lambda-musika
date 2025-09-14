import cx from 'classnames';
import { useEffect, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import styles from './ButtonWithPanel.module.scss';

type ButtonWithPanelProps = {
  panel?: React.ReactNode | undefined;
  onClose?: (() => void) | undefined;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>;

export function ButtonWithPanel({
  panel,
  children,
  onClose,
  ...other
}: ButtonWithPanelProps) {
  const outsideRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside it
  useOnClickOutside(outsideRef, panel ? onClose : null, 'mousedown');

  // Close panel when pressing Escape key
  useEffect(() => {
    if (!panel || !onClose) return;

    function handler(e: KeyboardEvent) {
      if (
        e.key === 'Escape' &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- checked above and nobody else could've modified it
        onClose!();
      }
    }

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [panel, onClose]);

  return (
    <div
      ref={outsideRef}
      className={cx(styles.container, { [styles.containerOpen]: panel })}
    >
      {panel ? <div className={styles.panelContainer}>{panel}</div> : null}

      <button
        type="button"
        className={cx(other.className, styles.button)}
        {...other}
      >
        {children}
      </button>
    </div>
  );
}
