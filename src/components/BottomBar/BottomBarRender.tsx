import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { SUPPORTED_BIT_DEPTHS, type BitDepth } from '../../lib/PCM';

const AVAILABLE_SAMPLE_RATES = [
  8000, 11025, 16000, 22500, 32000, 37800, 44100, 48000, 88200, 96000,
] as const;

type SampleRate = (typeof AVAILABLE_SAMPLE_RATES)[number];

const DEFAULT_SAMPLE_RATE = 44100 satisfies SampleRate;
const DEFAULT_BIT_RATE = 16 satisfies BitDepth;

type BottomBarRenderProps = {
  isRendering?: boolean;
  onRender: (sampleRate: number, bitDepth: BitDepth) => void;
};

export function BottomBarRender({
  isRendering = false,
  onRender,
}: BottomBarRenderProps) {
  const [renderSampleRate, setRenderSampleRate] =
    useState<SampleRate>(DEFAULT_SAMPLE_RATE);
  const [renderBitDepth, setRenderBitDepth] =
    useState<BitDepth>(DEFAULT_BIT_RATE);

  function handleRender() {
    onRender(renderSampleRate, renderBitDepth);
  }

  function handleChangeSampleRate(e: React.ChangeEvent<HTMLSelectElement>) {
    // as is safe because options are fixed
    setRenderSampleRate(Number(e.target.value) as SampleRate);
  }

  function handleChangeBitDepth(e: React.ChangeEvent<HTMLSelectElement>) {
    // as is safe because options are fixed
    setRenderBitDepth(Number(e.target.value) as BitDepth);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleRender}
        disabled={isRendering}
        title={isRendering ? 'Rendering audio...' : 'Render'}
        aria-label={isRendering ? 'Rendering audio...' : 'Render'}
      >
        <FontAwesomeIcon
          icon={isRendering ? faSpinner : faDownload}
          spin={isRendering}
        />
        .WAV
      </button>

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
            {b}bit
          </option>
        ))}
      </select>
    </>
  );
}
