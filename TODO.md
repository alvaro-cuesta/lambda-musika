# Lambda Musika TODO

## Milestones

### 0.0.2

- `[BUG]` `[PLAYER]` Sound clicks on play/pause/update
- `[BUG]` `[RENDERER]` Audible clicks when rendering the THX sound example
- `[TODO]` `[RENDERER]` Handling render `fn()` errors
- `[TODO]` `[COMPILER]` Also check possible syntax error of returned fn
- `[FEATURE]` `[APP]` Button hotkey tooltips

### 0.0.3

- `[FEATURE]` `[EDITOR]` Save/load code from file
- `[FEATURE]` `[EDITOR]` Preserve code between reloads
  - Add some way to reset to default song
  - Try to preserve Undo and other state between app loads

### 0.1.0

- `[DEV-FEATURE]` Deploy task: bump version, tag and publish to GH pages and NPM
  - https://www.npmjs.com/package/gh-pages
  - https://github.com/iamcco/gh-pages-webpack-plugin
  - https://gist.github.com/cobyism/4730490
  - https://github.com/bvaughn/react-virtualized/blob/master/package.json
  - http://survivejs.com/webpack/building-with-webpack/hosting-on-github-pages/
- `[TASK]` Bump version, push and deploy

### 0.1.x

- `[BUG]` `[PLAYER]` TimeSeeker maxes at 23:59 (HH:MM)

### 0.2.0

- `[FEATURE]` `[API]` `[PLAYER]` `[RENDERER]` Musika scripts with Mono output
- `[FEATURE]` `[PLAYER]` Volume slider
- `[FEATURE]` `[COSMETIC]` `[PLAYER]` VU meter

### 0.2.x

- `[FEATURE]` `[RENDERER]` Quantization
  - More quantization methods (currently truncating)
  - Dithering
  - Clamping?
- `[FEATURE]` `[RENDERER]` Float PCM output
- `[FEATURE]` `[RENDERER]` Select bit-depth etc. when rendering
- `[?]` `[RENDERER]` Handle big/little endian architectures (I don't remember
  what I meant with this task)

### 0.3.0

- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Log-to-Linear function and viceversa (for
  linear parameters into freqs and such)
  - Also for amplitude? I.e. work with decibels
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` More interpolations for Attack/release
  envelopes
  - Linear
  - Hermite
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` ADSR Envelope
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` Should inv envelopes actually be
  logarithmic?
- `[API]` `[MUSIKA]` `[MUSIKA-OPERATOR]` Panning helper
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Chordify signals (given an osc constructor,
  instance several and mix)
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Randomization helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Timing helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Compositional helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Arpeggiator
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Memoization helper
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Rate limiting helper (e.g. for control rates)

### 1.0.0

- `[COSMETIC]` `[APP]` Favicon(s)
- `[TODO]` `[MUSIKA]` Documentation
  - Add missing comments
  - Static documentation generation

### 1.0.x

- `[BUG]` `[EDITOR]` Editor has a fixed size and can't be resized really small
- `[TODO]` Build librar(y/ies) as UMD package(s) to be used outside of the DAW
    as a regular JavaScript library ([info]http://survivejs.com/webpack/loading-assets/formats-supported/)

### 2.0.0

- `[API]` `[PLAYER]` `[RENDERER]` Using `t` as DSP time variable is awkward
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only
    samples)
  - Possible solution: work with samples and `dt` instead
  - Problem: `t` is still useful in other situations (e.g. envelopes)


## Internal tasks

- `[BUG]` Since Player is a PureComponent, hot reloading it stops the song
  - Maybe the problem is HMR, try React Hot Loader 3
- `[TODO]` http://survivejs.com/webpack/building-with-webpack/separating-css/#separating-application-code-and-styling
  - Extract theme, components and vendor CSS separately
  - Check that vendor CSS hash doesn't change
- `[TODO]` Move Web Audio bits to library, abstracting audio playing in the
  process


## Unassigned

- Allow empty fn for player, but disable and gray out it


## Ideas or possible research lines

- `[COSMETIC]` "3D" box-shadow buttons Material Design style
- `[FEATURE]` `[API]` `[APP]` `[...]` Microphone/MIDI/keyboard/mouse input
- `[FEATURE]` `[APP]` Offline/AppCache
- `[FEATURE]` `[APP]` `[API]` `[COMPILER]` Declare sliders and other controls in
  scripts, which the user can control to affect sound/constants in real time
- `[FEATURE]` `[APP]` `[API]` `[COMPILER]` Static plots
  - Ability to plot arbitrary 2D data, formulas, etc.
  - Helpers for filter frequency response, FFT, etc.
- `[FEATURE]` `[APP]` Visualization
  - Wave
  - FFT
  - XY
- `[INTERNAL]` `[PLAYER]` Test alternate compiling/playing methods (if faster or
  more responsive)
  - `eval`
  - Premaking buffers via Workers
  - Script tag
  - ...
- `[COSMETIC]` `[PLAYER]` https://reactify.github.io/react-player-controls/
- `[COSMETIC]` `[EDITOR]` Custom scrollbars (https://github.com/ajaxorg/ace/issues/869)
- `[FEATURE]` `[EDITOR]` REPL
- `[FEATURE]` `[EDITOR]` Save/load code from Gist (+ link generation)
- `[FEATURE]` `[EDITOR]` Enable ACE worker but with custom rules
  - https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js
- `[FEATURE]` `[EDITOR]` Detect tab settings from buffer
- `[FEATURE]` `[EDITOR]` Continue comments
  - https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js
- `[FEATURE]` `[EDITOR]` `[COMPILER]` Multiple files/tabs
- `[FEATURE]` `[APP]` `[EDITOR]` Slider when double-clicking numerical values in editor
- `[FEATURE]` `[COMPILER]` Import Gists or other sources of functions (for custom
  libraries)
- `[FEATURE]` `[RENDERER]` MP3/OGG
- `[API]` `[MUSIKA]` Make the API more functional by taking Sin(), Constant(),
  etc. as parameters... i.e. take functions instead of values (easier composition)
  - Function calls might be expensive, leave it to the user?
- `[API]` `[MUSIKA]` Maybe use object options instead of parameters (for easier
  composition of functions)
  - Objects might be expensive, leave it to the user?
- `[FEATURE]` `[MUSIKA]` Equalizer

### Internal

- Move vendor libraries to CDN instead of `vendor` chunk
  - Maybe alternative build mode?
- Font Awesome is being used from CDN... Webpack it as vendor css/font? Include
  locally but don't bundle? Leave it on CDN?
- I'm importing the full Font Awesome instead of only the few icons I need
- http://survivejs.com/webpack/building-with-webpack/eliminating-unused-css/
- http://survivejs.com/webpack/building-with-webpack/analyzing-build-statistics/
- http://survivejs.com/webpack/loading-assets/loading-styles/
  - Stylus
  - CSS modules
- http://survivejs.com/webpack/advanced-techniques/linting/
- http://survivejs.com/webpack/advanced-techniques/authoring-packages/
- http://survivejs.com/webpack/advanced-techniques/configuring-react/
  - react-lite
  - TypeScript
  - Flow
