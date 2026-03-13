import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useCallback, useId } from 'react';
import { useSetting } from '../../hooks/useSetting.js';
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

  const panelId = useId();

  const panel = isOpen ? (
    <Panel
      id={panelId}
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
        <label className={styles.label}>
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
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-owns={panelId}
      aria-controls={panelId}
    >
      <FontAwesomeIcon
        className={cx(styles.icon, {
          [styles.iconActive]: isOpen,
        })}
        icon={faGear}
      />
    </ButtonWithPanel>
  );
}
