import { Panel } from './Panel';

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
    <Panel
      title={title}
      buttons={
        <>
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
        </>
      }
    >
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
    </Panel>
  );
}
