import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useCallback, useMemo, useReducer } from 'react';
import EmptyScript from '../../examples/empty.musika?raw';
import { EXAMPLE_SCRIPTS } from '../../examples/index.js';
import { type BitDepth } from '../../lib/PCM/PCM.js';
import styles from './BottomBar.module.scss';
import { BottomBarCommit } from './BottomBarCommit.js';
import { BottomBarExamples } from './BottomBarExamples.js';
import { BottomBarFiles } from './BottomBarFiles.js';
import { BottomBarRender } from './BottomBarRender.js';
import { BottomBarSettings } from './BottomBarSettings.js';

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
  | { state: 'renderOpen' }
  | { state: 'settingsOpen' }
  | { state: null };

type PanelAction =
  | { type: 'newConfirming' }
  | { type: 'loadConfirming'; fileName: string; fileContent: string }
  | { type: 'examplesOpen' }
  | { type: 'examplesConfirming'; exampleName: keyof typeof EXAMPLE_SCRIPTS }
  | { type: 'renderOpen' }
  | { type: 'settingsOpen' }
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
    case 'renderOpen':
      return state.state !== 'renderOpen'
        ? { state: 'renderOpen' }
        : { state: null };
    case 'settingsOpen':
      return state.state !== 'settingsOpen'
        ? { state: 'settingsOpen' }
        : { state: null };
    case 'close':
      return { state: null };
  }
}

type BottomBarProps = {
  isClean: boolean;
  lengthSecs: number | null;
  isRendering: boolean;
  onCommit: () => void;
  onNew: (source: string) => void;
  onSave: () => void;
  onRender: (sampleRate: number, bitDepth: BitDepth) => void;
};

export const BottomBar = ({
  isClean,
  lengthSecs,
  isRendering,
  onCommit,
  onNew,
  onSave,
  onRender,
}: BottomBarProps) => {
  const [panelState, dispatch] = useReducer(panelReducer, { state: null });

  const closePanels = useCallback(() => {
    dispatch({ type: 'close' });
  }, []);

  // Commit group

  const commitGroup = <BottomBarCommit onCommit={onCommit} />;

  // File group

  const fileGroupState = useMemo(
    () =>
      panelState.state === 'newConfirming'
        ? { state: 'newConfirming' as const }
        : panelState.state === 'loadConfirming'
          ? {
              state: 'loadConfirming' as const,
              fileName: panelState.fileName,
              fileContent: panelState.fileContent,
            }
          : { state: 'closed' as const },
    [panelState],
  );

  const handleNew = useCallback(
    (force?: boolean) => {
      if (isClean || force) {
        closePanels();
        onNew(EmptyScript);
      } else {
        dispatch({ type: 'newConfirming' });
      }
    },
    [isClean, onNew, closePanels],
  );

  const handleLoadFile = useCallback(
    (fileName: string, fileContent: string, force?: boolean) => {
      if (isClean || force) {
        closePanels();
        onNew(fileContent);
      } else {
        dispatch({ type: 'loadConfirming', fileName, fileContent });
      }
    },
    [isClean, onNew, closePanels],
  );

  const fileGroup = (
    <BottomBarFiles
      state={fileGroupState}
      onNew={handleNew}
      onLoad={handleLoadFile}
      onSave={onSave}
      onClose={closePanels}
    />
  );

  // Examples group

  const examplesGroupState = useMemo(
    () =>
      panelState.state === 'examplesOpen'
        ? { state: 'open' as const }
        : panelState.state === 'examplesConfirming'
          ? {
              state: 'confirming' as const,
              exampleName: panelState.exampleName,
            }
          : { state: 'closed' as const },
    [panelState],
  );

  const handleOpenExamples = useCallback(() => {
    dispatch({ type: 'examplesOpen' });
  }, []);

  const handleLoadExample = useCallback(
    (example: keyof typeof EXAMPLE_SCRIPTS, force?: boolean) => {
      if (isClean || force) {
        closePanels();
        onNew(EXAMPLE_SCRIPTS[example]);
      } else {
        dispatch({ type: 'examplesConfirming', exampleName: example });
      }
    },
    [isClean, onNew, closePanels],
  );

  const examplesGroup = (
    <BottomBarExamples
      state={examplesGroupState}
      onOpen={handleOpenExamples}
      onClose={closePanels}
      onLoad={handleLoadExample}
    />
  );

  // Render group

  const handleOpenRender = useCallback(() => {
    dispatch({ type: 'renderOpen' });
  }, []);

  const renderGroup =
    lengthSecs !== null ? (
      <BottomBarRender
        lengthSecs={lengthSecs}
        isOpen={panelState.state === 'renderOpen'}
        onOpen={handleOpenRender}
        onClose={closePanels}
        isRendering={isRendering}
        onRender={onRender}
      />
    ) : null;

  const handleOpenSettings = useCallback(() => {
    dispatch({ type: 'settingsOpen' });
  }, []);

  const settingsGroup = (
    <BottomBarSettings
      isOpen={panelState.state === 'settingsOpen'}
      onOpen={handleOpenSettings}
      onClose={closePanels}
    />
  );

  const aboutGroup = (
    <a
      className={styles.github}
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
    <div className={styles.panelWrapper}>
      <div className={styles.container}>
        <div className={cx(styles.group, 'color-orange')}>{commitGroup}</div>
        <div className={cx(styles.group, 'color-purple')}>{fileGroup}</div>
        <div className={cx(styles.group, 'color-blue')}>{examplesGroup}</div>
        {renderGroup !== null ? (
          <div className={cx(styles.group, 'color-red')}>{renderGroup}</div>
        ) : null}
        <div className={cx(styles.group, 'color-dark-blue')}>
          {settingsGroup}
        </div>
        <div className={styles.gap} />
        <div className={styles.group}>{aboutGroup}</div>
      </div>
    </div>
  );
};
