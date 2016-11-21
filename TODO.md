# Lambda Musika TODO

- Using t as a control is probably not... good
  - Abstraction is leaking everywhere (e.g. filters don't work with time)
  - Maybe work with samples and dt
- Microphone/MIDI/keyboard/mouse input
- Mono sounds

## DAW Interface

- TimeSeeker when length = undefined
- Static plot to confirm formulas
  - Arbitrary formula
  - Filter frequency response, FFT, etc.

## Player

- Alternate realtime-rendering methods
  - Premaking buffers via Workers

## Editor

- Import Gists or other sources of functions (for custom libraries)
- Save/load code from file
- Save/load code from Gist (+ link generation)

## Renderer

- Handle big/little endian architectures
  - I don't remember what this means
- Quantization
  - More quantization methods (currently truncating)
  - Dithering
  - Clamping?
- Float buffer output
- Select bit-depth etc. when rendering

## Musika

- Documentation
  - Add comments
  - Static documentation generation
- Log-to-Linear function (for linear parameters into freqs and such)
  - Also for amplitude?
- Envelopes
  - Attack/release more interpolations
    - Linear
    - Hermite
    - Is inv actually log?
  - ADSR
- Musical utilities
  - Chordify signals (given an osc constructor, instance several and mix)
  - Randomization helpers
  - Timing helpers
  - Compositional helpers
  - Arpeggiator

## Development

- Fix hot module replacement
- Move PCM to library?

## Maybe

- Musika Equalizer
- Visualization
  - Wave
  - FFT
  - XY
- MP3/OGG rendering
