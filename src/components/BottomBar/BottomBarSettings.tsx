import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useCallback } from 'react';
import { useSetting } from '../../utils/settings.js';
import styles from './BottomBarSettings.module.scss';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { Panel } from './Panel.js';

type BottomBarSettingsProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function BottomBarSettings({
  isOpen,
  onOpen,
  onClose,
}: BottomBarSettingsProps) {
  const [editorFontSize, setEditorFontSize] = useSetting('editorFontSize');

  const handleEditorFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      if (Number.isNaN(v)) {
        return;
      }
      setEditorFontSize(v);
    },
    [setEditorFontSize],
  );

  const panel = isOpen ? (
    <Panel
      title="Settings"
      buttons={
        <>
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </>
      }
    >
      <p>
        <label className={styles['label']}>
          Editor font size:
          <input
            type="number"
            min={1}
            max={128}
            value={editorFontSize}
            onChange={handleEditorFontSizeChange}
          />
        </label>
      </p>
    </Panel>
  ) : null;

  return (
    <ButtonWithPanel
      onClick={onOpen}
      onClose={onClose}
      panel={panel}
      title="Settings"
      aria-label="Settings"
    >
      <FontAwesomeIcon
        className={cx(styles['icon'], isOpen ? styles['icon--active'] : '')}
        icon={faGear}
      />
    </ButtonWithPanel>
  );
}
