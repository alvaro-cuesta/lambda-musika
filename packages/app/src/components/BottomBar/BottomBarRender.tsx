import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import {
  getWavFileSize,
  SUPPORTED_BIT_DEPTHS,
  type BitDepth,
} from '../../lib/PCM/PCM.js';
import styles from './BottomBarRender.module.scss';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { Panel } from './Panel.js';

const AVAILABLE_SAMPLE_RATES = [
  8000, 11025, 16000, 22500, 32000, 37800, 44100, 48000, 88200, 96000,
] as const;

type SampleRate = (typeof AVAILABLE_SAMPLE_RATES)[number];

const DEFAULT_SAMPLE_RATE = 44100 satisfies SampleRate;
const DEFAULT_BIT_RATE = 'float32' satisfies BitDepth;

function formatFileSize(bytes: number) {
  return (
    prettyBytes(bytes, {
      locale: 'en',
      space: false,
      // Docs say not to use it for file sizes but turns out this is what matches FF and Chrome downloads
      binary: true,
    })
      // `binary: true` ouputs MiB though, which is technically correct but not what people expect (and not what FF and
      // Chrome show), so we replace it here
      .replace(/iB$/g, 'B')
  );
}

type BottomBarRenderProps = {
  lengthSecs: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isRendering?: boolean;
  onRender: (sampleRate: number, bitDepth: BitDepth) => void;
};

export function BottomBarRender({
  lengthSecs,
  isOpen,
  onOpen,
  onClose,
  isRendering = false,
  onRender,
}: BottomBarRenderProps) {
  const [renderSampleRate, setRenderSampleRate] =
    useState<SampleRate>(DEFAULT_SAMPLE_RATE);
  const [renderBitDepth, setRenderBitDepth] =
    useState<BitDepth>(DEFAULT_BIT_RATE);

  const fileSize = getWavFileSize(
    renderSampleRate,
    renderBitDepth,
    2,
    lengthSecs,
  );

  function handleRender() {
    onRender(renderSampleRate, renderBitDepth);
  }

  function handleChangeSampleRate(e: React.ChangeEvent<HTMLSelectElement>) {
    // as is safe because options are fixed
    setRenderSampleRate(Number(e.target.value) as SampleRate);
  }

  function handleChangeBitDepth(e: React.ChangeEvent<HTMLSelectElement>) {
    // as is safe because options are fixed
    setRenderBitDepth(e.target.value as BitDepth);
  }

  const panel = isOpen ? (
    <Panel
      title="Download .WAV"
      buttons={
        <>
          <button
            type="button"
            onClick={handleRender}
            disabled={isRendering}
          >
            {isRendering
              ? 'Rendering audio...'
              : `Render (${formatFileSize(fileSize)})`}
          </button>

          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </>
      }
    >
      <p className={styles.group}>
        <select
          onChange={handleChangeSampleRate}
          value={renderSampleRate}
          disabled={isRendering}
          title="Render sample rate"
          aria-label="Render sample rate"
        >
          {AVAILABLE_SAMPLE_RATES.map((f) => (
            <option
              key={f}
              value={f}
            >
              {f}Hz
            </option>
          ))}
        </select>

        <select
          onChange={handleChangeBitDepth}
          value={renderBitDepth}
          disabled={isRendering}
          title="Render bit depth"
          aria-label="Render bit depth"
        >
          {SUPPORTED_BIT_DEPTHS.map((b) => (
            <option
              key={b}
              value={b}
            >
              {b}
            </option>
          ))}
        </select>
      </p>
    </Panel>
  ) : null;

  return (
    <ButtonWithPanel
      onClick={onOpen}
      onClose={onClose}
      panel={panel}
      title="Examples"
      aria-label="Examples"
    >
      <FontAwesomeIcon
        icon={isRendering ? faSpinner : faDownload}
        spin={isRendering}
      />
      .WAV
    </ButtonWithPanel>
  );
}
