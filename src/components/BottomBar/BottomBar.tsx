import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import {
  faDownload,
  faFile,
  faFileArrowDown,
  faFileArrowUp,
  faFileText,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import EmptyScript from '../../examples/empty.musika?raw';
import { EXAMPLE_SCRIPTS } from '../../examples/index.js';
import styles from './BottomBar.module.scss';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { ConfirmPanel } from './ConfirmPanel.js';

type PanelState =
  | { state: 'newConfirming' }
  | {
      state: 'loadConfirming';
      fileName: string;
      fileContent: string;
    }
  | { state: 'examplesOpen' }
  | {
      state: 'examplesConfirming';
      exampleName: keyof typeof EXAMPLE_SCRIPTS;
    }
  | { state: null };

type PanelAction =
  | { type: 'newConfirming' }
  | { type: 'loadConfirming'; fileName: string; fileContent: string }
  | { type: 'examplesOpen' }
  | { type: 'examplesConfirming'; exampleName: keyof typeof EXAMPLE_SCRIPTS }
  | { type: 'close' };

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'newConfirming':
      return state.state !== 'newConfirming'
        ? { state: 'newConfirming' }
        : { state: null };
    case 'loadConfirming':
      return state.state !== 'loadConfirming'
        ? {
            state: 'loadConfirming',
            fileName: action.fileName,
            fileContent: action.fileContent,
          }
        : { state: null };
    case 'examplesOpen':
      return state.state !== 'examplesOpen'
        ? { state: 'examplesOpen' }
        : { state: null };
    case 'examplesConfirming':
      return state.state !== 'examplesConfirming'
        ? { state: 'examplesConfirming', exampleName: action.exampleName }
        : { state: null };
    case 'close':
      return { state: null };
  }
}

const RENDER_FREQUENCIES = [
  8000, 11025, 16000, 22500, 32000, 37800, 44100, 48000, 88200, 96000,
] as const;

type BottomBarProps = {
  isClean: boolean;
  showRenderControls: boolean;
  onUpdate: () => void;
  onNew: (source: string) => void;
  onSave: () => void;
  onRender: (sampleRate: number) => void;
};

export const BottomBar = ({
  isClean,
  showRenderControls,
  onUpdate,
  onNew,
  onSave,
  onRender,
}: BottomBarProps) => {
  const [panelState, dispatch] = useReducer(panelReducer, { state: null });
  const [renderSampleRate, setRenderSampleRate] = useState(44100);

  const closePanels = useCallback(() => {
    dispatch({ type: 'close' });
  }, []);

  function handleNew() {
    if (isClean) {
      handleNewConfirmed();
    } else {
      dispatch({ type: 'newConfirming' });
    }
  }

  function handleNewConfirmed() {
    closePanels();
    onNew(EmptyScript);
  }

  function handleLoad() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.musika,application/javascript';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;

      const r = new FileReader();
      r.onload = (e) => {
        // as string is safe because we did readAsText
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe because it is never null
        const content = e.target!.result as string;
        if (isClean) {
          handleLoadConfirmed(content);
        } else {
          dispatch({
            type: 'loadConfirming',
            fileName: f.name,
            fileContent: content,
          });
        }
      };
      r.readAsText(f);
    };
    input.click();
  }

  function handleLoadConfirmed(source: string) {
    onNew(source.replace(/\r\n/g, '\n'));
    dispatch({ type: 'close' });
  }

  function handleSave() {
    closePanels();
    onSave();
  }

  function handleExamples() {
    dispatch({ type: 'examplesOpen' });
  }

  function handleExamplesConfirmed(example: keyof typeof EXAMPLE_SCRIPTS) {
    closePanels();
    onNew(EXAMPLE_SCRIPTS[example]);
  }

  function handleRender() {
    onRender(renderSampleRate);
  }

  function handleRenderSampleRate(e: React.ChangeEvent<HTMLSelectElement>) {
    setRenderSampleRate(Number(e.target.value));
  }

  // CTRL+S = onUpdate
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        e.key === 's'
      ) {
        e.preventDefault();
        onUpdate();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUpdate]);

  const updateControls = (
    <div className={styles['group']}>
      <button
        type="button"
        className="color-orange"
        onClick={onUpdate}
        title="CTRL-S"
        aria-label="Commit (CTRL-S)"
      >
        <FontAwesomeIcon icon={faShare} />
        Commit
      </button>
    </div>
  );

  const newConfirmPanel =
    panelState.state === 'newConfirming' ? (
      <ConfirmPanel
        title="New script"
        onAccept={handleNewConfirmed}
        onCancel={closePanels}
      />
    ) : null;

  const loadConfirmPanel =
    panelState.state === 'loadConfirming' ? (
      <ConfirmPanel
        title="Load file"
        loadName={panelState.fileName}
        onAccept={() => {
          handleLoadConfirmed(panelState.fileContent);
        }}
        onCancel={closePanels}
      />
    ) : null;

  const examplesPanel =
    panelState.state === 'examplesOpen' ||
    panelState.state === 'examplesConfirming' ? (
      <div>
        <h1>Examples</h1>
        {panelState.state !== 'examplesConfirming' ? (
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
                      if (isClean) {
                        handleExamplesConfirmed(name);
                      } else {
                        dispatch({
                          type: 'examplesConfirming',
                          exampleName: name,
                        });
                      }
                    }}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={closePanels}
            >
              Close
            </button>
          </div>
        ) : (
          <ConfirmPanel
            loadName={panelState.exampleName}
            onAccept={() => {
              handleExamplesConfirmed(panelState.exampleName);
            }}
            onCancel={closePanels}
          />
        )}
      </div>
    ) : null;

  const fileControls = (
    <div className={cx('color-purple', styles['group'])}>
      <ButtonWithPanel
        onClick={handleNew}
        onClose={closePanels}
        panel={newConfirmPanel}
        title="New"
        aria-label="New"
      >
        <FontAwesomeIcon icon={faFile} />
      </ButtonWithPanel>

      <ButtonWithPanel
        onClick={handleLoad}
        onClose={closePanels}
        panel={loadConfirmPanel}
        title="Load"
        aria-label="Load"
      >
        <FontAwesomeIcon icon={faFileArrowUp} />
      </ButtonWithPanel>

      <button
        type="button"
        onClick={handleSave}
        title="Save"
        aria-label="Save"
      >
        <FontAwesomeIcon icon={faFileArrowDown} />
      </button>
    </div>
  );

  const exampleControls = (
    <div className={cx('color-blue', styles['group'])}>
      <ButtonWithPanel
        onClick={handleExamples}
        onClose={closePanels}
        panel={examplesPanel}
        title="Examples"
        aria-label="Examples"
      >
        <FontAwesomeIcon icon={faFileText} />
        Examples
      </ButtonWithPanel>
    </div>
  );

  const renderControls = showRenderControls ? (
    <div className={cx('color-red', styles['group'])}>
      <button
        type="button"
        onClick={handleRender}
        title="Render"
        aria-label="Render"
      >
        <FontAwesomeIcon icon={faDownload} />
        .WAV
      </button>

      <select
        onChange={handleRenderSampleRate}
        value={renderSampleRate}
        title="Render sample rate"
        aria-label="Render sample rate"
      >
        {RENDER_FREQUENCIES.map((f) => (
          <option
            key={f}
            value={f}
          >
            {f}Hz
          </option>
        ))}
      </select>
    </div>
  ) : null;

  const aboutControls = (
    <div className={styles['group']}>
      <a
        className={styles['github']}
        href={import.meta.env.PACKAGE_CONFIG_REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon
          icon={faGithub}
          title="alvaro-cuesta/lambda-musika at GitHub"
        />
      </a>
    </div>
  );

  return (
    <div className={styles['panel-wrapper']}>
      <div className={styles['container']}>
        {updateControls}
        {fileControls}
        {exampleControls}
        {renderControls}
        <div className={styles['gap']} />
        {aboutControls}
      </div>
    </div>
  );
};
