# Lambda Musika TODO

## Bugs

- Using `t` as DSP time variable is awkward
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only
    samples)
  - Possible solution: work with samples and `dt` instead
  - Problem: `t` is still useful in other situations (e.g. envelopes)

##### - DAW Interface

##### - Player

- Sound clicks on play/pause/update
- There is leftover sound from previous buffer state after pausing, updating an
  then playing the new buffer
- TimeSeeker maxes at 23:59

##### - Editor

- Syntax errors (e.g. omitting `=` in `const` declaration) marks are bugged
- Uncaught errors on CTRL-S open the document save window

##### - Renderer

- Audible clicks when rendering the THX sound example
- TODO: Not handling render fn() errors

##### - Musika

##### - Development

- Since Player is a PureComponent, hot reloading it stops the song
  - Maybe the problem is HMR, try React Hot Loader 3



## Features

- Musika scripts with Mono output

##### - DAW Interface

- Favicon(s)

##### - Player

- New `TimeSeeker` when `length === undefined`
  - Zero, Rewind, FF, FFF
- Volume slider

##### - Editor

- Show errors on status bar or line (right now in the gutter they're quite
  unnoticeable)
- Preserve code on F5 (how to reset to default song then?)

##### - Renderer

- Handle big/little endian architectures (I don't remember what I meant with
  this task)
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
- Log-to-Linear function and viceversa (for linear parameters into freqs and such)
  - Also for amplitude? I.e. work with decibels
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
- Memoization helper
- Rate limiting helper
- Panning helper

##### - Development

- Deploy task: bump version, tag and publish to GH pages and NPM
  - https://www.npmjs.com/package/gh-pages
  - https://github.com/iamcco/gh-pages-webpack-plugin
  - https://gist.github.com/cobyism/4730490
  - https://github.com/bvaughn/react-virtualized/blob/master/package.json
  - http://survivejs.com/webpack/building-with-webpack/hosting-on-github-pages/
- http://survivejs.com/webpack/building-with-webpack/separating-css/#separating-application-code-and-styling
  - Extract theme, components and vendor CSS separately
  - Check that vendor CSS hash doesn't change
- Move Web Audio bits to library, abstracting audio playing in the process



## Ideas or possible research lines

- Microphone/MIDI/keyboard/mouse input
- Offline/AppCache

##### - DAW Interface

- Declare sliders and other controls in scripts, which the user can control
  to affect sound/constants in real time
- Static plots
  - Ability to plot arbitrary 2D data, formulas, etc.
  - Helpers for filter frequency response, FFT, etc.
- Visualization
  - Wave
  - FFT
  - XY

##### - Player

- Test alternate playing methods (if faster or more responsive)
  - `eval`
  - Premaking buffers via Workers
  - Script tag
- https://reactify.github.io/react-player-controls/

##### - Editor

- Custom scrollbars (https://github.com/ajaxorg/ace/issues/869)
- REPL
- Import Gists or other sources of functions (for custom libraries)
- Save/load code from file
- Save/load code from Gist (+ link generation)
- Enable ACE worker but with custom rules
- Detect tab settings from buffer
- Continue comments
- Slider when double-clicking numerical values in editor

##### - Renderer

- MP3/OGG

##### - Musika

- Make the API more functional by taking Sin(), Constant(), etc. as parameters...
  i.e. take functions instead of values (easier composition)
  - Function calls might be expensive, leave it to the user?
- Equalizer

##### - Development

- https://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
- `new webpack.optimize.OccurrenceOrderPlugin(true)`
- Move vendor libraries to CDN instead of `vendor` chunk
- Font Awesome is being used from CDN... Webpack it as vendor css/font? Include
  locally but don't bundle? Leave it on CDN?
- I'm importing the full Font Awesome instead of only the few icons I need
- http://survivejs.com/webpack/building-with-webpack/eliminating-unused-css/
- http://survivejs.com/webpack/building-with-webpack/analyzing-build-statistics/
- http://survivejs.com/webpack/loading-assets/formats-supported/
  - Build library as an UMD package to be used outside of the DAW as a
    regular JavaScript library
- http://survivejs.com/webpack/loading-assets/loading-styles/
  - Stylus
  - CSS modules
- http://survivejs.com/webpack/advanced-techniques/linting/
- http://survivejs.com/webpack/advanced-techniques/authoring-packages/
- http://survivejs.com/webpack/advanced-techniques/configuring-react/
  - TypeScript
  - Flow
