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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

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

  // Focus management
  useEffect(() => {
    const isOpen = panel != null;

    if (isOpen && !wasOpenRef.current) {
      const panelContainer = panelContainerRef.current;

      if (panelContainer) {
        panelContainer.focus({ preventScroll: true });
      }
    }

    if (!isOpen && wasOpenRef.current) {
      triggerRef.current?.focus({ preventScroll: true });
    }

    wasOpenRef.current = isOpen;
  }, [panel]);

  return (
    <div
      ref={outsideRef}
      className={cx(styles.container, { [styles.containerOpen]: panel })}
    >
      {panel ? (
        <div
          ref={panelContainerRef}
          className={styles.panelContainer}
          tabIndex={-1}
        >
          {panel}
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        className={cx(other.className, styles.button)}
        {...other}
      >
        {children}
      </button>
    </div>
  );
}
