/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import {
  faFile,
  faFileArrowDown,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useId } from 'react';
import { loadFile } from '../../utils/file.js';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { ConfirmPanel } from './ConfirmPanel.js';

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
  const newPanelId = useId();
  const loadPanelId = useId();

  const newConfirmPanel =
    state.state === 'newConfirming' ? (
      <ConfirmPanel
        id={newPanelId}
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
        id={loadPanelId}
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
        title="New script"
        aria-haspopup="dialog"
        aria-expanded={state.state === 'newConfirming'}
        aria-owns={newPanelId}
        aria-controls={newPanelId}
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
        title="Load script"
        aria-haspopup="dialog"
        aria-expanded={state.state === 'loadConfirming'}
        aria-owns={loadPanelId}
        aria-controls={loadPanelId}
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
      >
        <FontAwesomeIcon icon={faFileArrowDown} />
      </button>
    </>
  );
}
