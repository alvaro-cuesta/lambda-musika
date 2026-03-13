/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useId } from 'react';
import { EXAMPLE_SCRIPTS } from '../../examples/index.js';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { ConfirmPanel } from './ConfirmPanel.js';
import { Panel } from './Panel.js';

type BottomBarExamplesProps = {
  state:
    | { state: 'closed' }
    | { state: 'open' }
    | { state: 'confirming'; exampleName: keyof typeof EXAMPLE_SCRIPTS };
  onOpen(): void;
  onClose(): void;
  onLoad(example: keyof typeof EXAMPLE_SCRIPTS, force?: boolean): void;
};

export function BottomBarExamples({
  state,
  onOpen,
  onClose,
  onLoad,
}: BottomBarExamplesProps) {
  const panelId = useId();

  const panelContent =
    state.state === 'open' ? (
      <Panel
        id={panelId}
        title="Examples"
        buttons={
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        }
      >
        <ul>
          {(
            Object.keys(EXAMPLE_SCRIPTS) as (keyof typeof EXAMPLE_SCRIPTS)[]
          ).map((name) => (
            <li key={name}>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  onLoad(name);
                }}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    ) : state.state === 'confirming' ? (
      <ConfirmPanel
        id={panelId}
        loadName={state.exampleName}
        onAccept={() => {
          onLoad(state.exampleName, true);
        }}
        onCancel={onClose}
      />
    ) : null;

  return (
    <ButtonWithPanel
      onClick={onOpen}
      onClose={onClose}
      panel={panelContent}
      title="Examples"
      aria-haspopup="dialog"
      aria-expanded={state.state !== 'closed'}
      aria-owns={panelId}
      aria-controls={panelId}
    >
      <FontAwesomeIcon icon={faFileText} />
      <span aria-hidden="true">Examples</span>
    </ButtonWithPanel>
  );
}
