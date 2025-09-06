import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import {
  faFile,
  faFileArrowDown,
  faFileArrowUp,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useCallback, useEffect, useReducer } from 'react';
import EmptyScript from '../../examples/empty.musika?raw';
import { EXAMPLE_SCRIPTS } from '../../examples/index.js';
import { type BitDepth } from '../../lib/PCM.js';
import styles from './BottomBar.module.scss';
import { BottomBarExamples } from './BottomBarExamples.js';
import { BottomBarRender } from './BottomBarRender.js';
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

type BottomBarProps = {
  isClean: boolean;
  showRenderControls: boolean;
  onUpdate: () => void;
  onNew: (source: string) => void;
  onSave: () => void;
  onRender: (sampleRate: number, bitDepth: BitDepth) => void;
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

  const updateGroup = (
    <button
      type="button"
      onClick={onUpdate}
      title="CTRL-S"
      aria-label="Commit (CTRL-S)"
    >
      <FontAwesomeIcon icon={faShare} />
      Commit
    </button>
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

  const fileGroup = (
    <>
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
    </>
  );

  const examplesGroup = (
    <BottomBarExamples
      state={
        panelState.state === 'examplesOpen'
          ? { state: 'open' }
          : panelState.state === 'examplesConfirming'
            ? { state: 'confirming', exampleName: panelState.exampleName }
            : { state: 'closed' }
      }
      onOpen={() => {
        dispatch({ type: 'examplesOpen' });
      }}
      onClose={closePanels}
      onLoad={(
        example: keyof typeof EXAMPLE_SCRIPTS,
        action: 'load' | 'confirm',
      ) => {
        if (isClean || action === 'confirm') {
          closePanels();
          onNew(EXAMPLE_SCRIPTS[example]);
        } else {
          dispatch({
            type: 'examplesConfirming',
            exampleName: example,
          });
        }
      }}
    />
  );

  const renderGroup = showRenderControls ? (
    <BottomBarRender onRender={onRender} />
  ) : null;

  const aboutGroup = (
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
  );

  return (
    <div className={styles['panel-wrapper']}>
      <div className={styles['container']}>
        <div className={cx(styles['group'], 'color-orange')}>{updateGroup}</div>
        <div className={cx(styles['group'], 'color-purple')}>{fileGroup}</div>
        <div className={cx(styles['group'], 'color-blue')}>{examplesGroup}</div>
        <div className={cx(styles['group'], 'color-red')}>{renderGroup}</div>
        <div className={styles['gap']} />
        <div className={styles['group']}>{aboutGroup}</div>
      </div>
    </div>
  );
};
