import styles from './Panel.module.scss';

type PanelProps = {
  title?: string | undefined;
  buttons?: React.ReactNode;
  children?: React.ReactNode;
};

export function Panel({ title, buttons, children }: PanelProps) {
  return (
    <div>
      {title ? <h1>{title}</h1> : null}
      {children}
      <div className={styles['group']}>{buttons}</div>
    </div>
  );
}
