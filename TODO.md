# Lambda Musika TODO

## Bugs

- Using `t` as DSP time variable is probably not... good
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only
    samples)
  - Possible solution: work with samples and `dt` instead
- Sound click on play/pause/update

## Features

- Musika scripts with Mono output
- Memoization helper
- Rate limiting helper

##### - DAW Interface

- New `TimeSeeker` when `length === undefined`
  - Zero, Rewind, FF, FFF
- Static plot window to confirm formulas
  - Ability to plot arbitrary 2D data
  - Helpers for filter frequency response, FFT, etc.
- Favicon(s)

##### - Player

- Alternate realtime-rendering methods (if faster or more responsive)
  - `eval`
  - Premaking buffers via Workers

##### - Editor

- Import Gists or other sources of functions (for custom libraries)
- Save/load code from file
- Save/load code from Gist (+ link generation)

##### - Renderer

- Handle big/little endian architectures (I don't remember what this means)
- Quantization
  - More quantization methods (currently truncating)
  - Dithering
  - Clamping?
- Float buffer output
- Select bit-depth etc. when rendering

##### - Musika

- Documentation
  - Add comments
  - Static documentation generation
- Log-to-Linear function (for linear parameters into freqs and such)
  - Also for amplitude?
- Envelopes
  - Attack/release more interpolations
    - Linear
    - Hermite
    - Is maybe inv actually logaritmic?
  - ADSR
- Musical utilities
  - Chordify signals (given an osc constructor, instance several and mix)
  - Randomization helpers
  - Timing helpers
  - Compositional helpers
  - Arpeggiator

##### - Development

- Fix hot module replacement
- Move PCM to library?
- Auto publish to GH pages

##### - Maybe

- Musika Equalizer
- Visualization
  - Wave
  - FFT
  - XY
- Microphone/MIDI/keyboard/mouse input
- MP3/OGG rendering
