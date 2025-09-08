/* eslint-disable @typescript-eslint/unbound-method -- false positive, not methods but React props */
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXAMPLE_SCRIPTS } from '../../examples/index.js';
import { ButtonWithPanel } from './ButtonWithPanel.jsx';
import { ConfirmPanel } from './ConfirmPanel.jsx';

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
  const panelContent =
    state.state === 'open' ? (
      <div>
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
        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : state.state === 'confirming' ? (
      <ConfirmPanel
        loadName={state.exampleName}
        onAccept={() => {
          onLoad(state.exampleName, true);
        }}
        onCancel={onClose}
      />
    ) : null;

  const panel = panelContent ? (
    <div>
      <h1>Examples</h1>
      {panelContent}
    </div>
  ) : null;

  return (
    <ButtonWithPanel
      onClick={onOpen}
      onClose={onClose}
      panel={panel}
      title="Examples"
      aria-label="Examples"
    >
      <FontAwesomeIcon icon={faFileText} />
      Examples
    </ButtonWithPanel>
  );
}
