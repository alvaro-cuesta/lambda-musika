import styles from './ConfirmPanel.module.scss';

type ConfirmPanelProps = {
  title?: string;
  loadName?: string;
  onAccept: () => void;
  onCancel: () => void;
};

export function ConfirmPanel({
  title,
  loadName,
  onAccept,
  onCancel,
}: ConfirmPanelProps) {
  return (
    <div>
      {title ? <h1>{title}</h1> : null}
      <p>
        This will delete <em>everything</em>, including your undo history.
        <br />
        <b>It cannot be undone.</b>
      </p>
      {loadName ? (
        <p>
          Discard all changes and load «<em>{loadName}</em>»?
        </p>
      ) : (
        <p>Discard all changes?</p>
      )}

      <div className={styles['group']}>
        <button
          type="button"
          onClick={onAccept}
        >
          Accept
        </button>{' '}
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
