import { useId } from 'react';
import styles from './Panel.module.scss';

type PanelProps = {
  id?: string | undefined;
  title?: string | undefined;
  'aria-label'?: string | undefined;
  buttons?: React.ReactNode;
  children?: React.ReactNode;
};

export function Panel({
  id,
  title,
  buttons,
  children,
  'aria-label': ariaLabel,
}: PanelProps) {
  const titleId = useId();

  return (
    <div
      id={id}
      role="dialog"
      aria-labelledby={!ariaLabel && title ? titleId : undefined}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {title ? <h1 id={titleId}>{title}</h1> : null}
      {children}
      <div className={styles.group}>{buttons}</div>
    </div>
  );
}
