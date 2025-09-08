/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import {
  faFile,
  faFileArrowDown,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { loadFile } from '../../utils/file.js';
import { ButtonWithPanel } from './ButtonWithPanel.jsx';
import { ConfirmPanel } from './ConfirmPanel.jsx';

type BottomBarFilesProps = {
  state:
    | { state: 'closed' }
    | { state: 'newConfirming' }
    | { state: 'loadConfirming'; fileName: string; fileContent: string };
  onNew(force?: boolean): void;
  onLoad(fileName: string, fileContent: string, force?: boolean): void;
  onSave(): void;
  onClose(): void;
};

export function BottomBarFiles({
  state,
  onNew,
  onLoad,
  onSave,
  onClose,
}: BottomBarFilesProps) {
  const newConfirmPanel =
    state.state === 'newConfirming' ? (
      <ConfirmPanel
        title="New script"
        onAccept={() => {
          onNew(true);
        }}
        onCancel={onClose}
      />
    ) : null;

  const loadConfirmPanel =
    state.state === 'loadConfirming' ? (
      <ConfirmPanel
        title="Load file"
        loadName={state.fileName}
        onAccept={() => {
          onLoad(state.fileName, state.fileContent, true);
        }}
        onCancel={onClose}
      />
    ) : null;

  return (
    <>
      <ButtonWithPanel
        onClick={() => {
          onNew();
        }}
        onClose={onClose}
        panel={newConfirmPanel}
        title="New"
        aria-label="New"
      >
        <FontAwesomeIcon icon={faFile} />
      </ButtonWithPanel>

      <ButtonWithPanel
        onClick={() => {
          void loadFile('text', '.musika,application/javascript').then(
            (result) => {
              if (result === null) {
                alert('Failed to load file');
                return;
              }
              const { name, content } = result;
              onLoad(
                name,
                // Ensure consistent line endings
                content.replace(/\r\n/g, '\n'),
              );
            },
          );
        }}
        onClose={onClose}
        panel={loadConfirmPanel}
        title="Load"
        aria-label="Load"
      >
        <FontAwesomeIcon icon={faFileArrowUp} />
      </ButtonWithPanel>

      <button
        type="button"
        onClick={() => {
          onClose();
          onSave();
        }}
        title="Save"
        aria-label="Save"
      >
        <FontAwesomeIcon icon={faFileArrowDown} />
      </button>
    </>
  );
}
