# Lambda Musika TODO

## Milestones

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
- `[FEATURE]` `[EDITOR]` Save as (allow right-click save-as on save button?)
- `[FEATURE]` `[EDITOR]` Hotkeys for time seeking
- `[FEATURE]` `[SCRIPTS]` Use strict mode?

### 0.2.0

- `[FEATURE]` `[API]` `[PLAYER]` `[RENDERER]` Musika scripts with Mono output
- `[FEATURE]` `[PLAYER]` Volume slider
- `[FEATURE]` `[COSMETIC]` `[PLAYER]` VU meter

### 0.2.x

- `[FEATURE]` `[RENDERER]` Quantization
  - More quantization methods (currently truncating)
  - [Dithering](http://www.earlevel.com/main/category/digital-audio/dither-digital-audio/)
  - Clamping?
- `[FEATURE]` `[RENDERER]` Float PCM output
- `[FEATURE]` `[RENDERER]` Select bit-depth etc. when rendering
- `[?]` `[RENDERER]` Handle big/little endian architectures (I don't remember
  what I meant with this task)

### 0.3.0

- `[API]` `[MUSIKA]` popping_wip example was bugged: since you can seek time,
  `t` is non-monotonic, which made the state invalid. Is this a flaw of the API?
  Should the user not assume `t` is monotonic? Maybe some kind of events?

  Another instance: biquad filters became unstable because of `t` not being
  monotonic.
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Log-to-Linear function and viceversa (for
  linear parameters into freqs and such)
  - Also for amplitude? I.e. work with decibels
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` More interpolations for Attack/release
  envelopes
  - Linear
  - Hermite
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` [ADSR Envelope](http://www.earlevel.com/main/category/digital-audio/oscillators/envelope-generators/?orderby=date&order=ASC)
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` Should inv envelopes actually be
  logarithmic?
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Chordify signals (given an osc constructor,
  instance several and mix)
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Randomization helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Timing helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Compositional helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Arpeggiator
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Memoization helper
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Rate limiting helper (e.g. for control rates)

### 1.0.0

- `[BUG]` `[PLAYER]` Sound clicks on play/pause/update/seek
- `[FEATURE]` `[COSMETIC]` `[APP]` Some kind of help/README/intro/tutorial
- `[FEATURE]` `[COSMETIC]` `[EDITOR]` Visual feedback after commit (annotation?)
- `[COSMETIC]` `[APP]` Favicon(s)
- `[TODO]` `[MUSIKA]` Documentation
  - Add missing comments
  - Static documentation generation

### 1.0.x

- `[BUG]` `[APP]` Make app accessible (make sure to actually _try_ the app)
- `[FEATURE]` `[RENDERER]` Render in background using web workers. Try [adapting
  to the number of cores](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency).
- `[BUG]` `[EDITOR]` Editor has a fixed size and can't be resized really small
- `[TODO]` [Build librar(y/ies) as UMD package(s)](http://survivejs.com/webpack/loading-assets/formats-supported/#umd to be used outside of the DAW as a regular JavaScript library)

### 2.0.0

- `[API]` `[PLAYER]` `[RENDERER]` Using `t` as DSP time variable is awkward
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only
    samples)
  - Possible solution: work with samples and `dt` instead
  - Problem: `t` is still useful in other situations (e.g. envelopes)


## Internal tasks

- `[BUG]` Since Player/Editor are PureComponents, hot reloading stops the song
  and re-renders the editor
  - Maybe the problem is HMR, try React Hot Loader 3
- `[TODO]` http://survivejs.com/webpack/building-with-webpack/separating-css/#separating-application-code-and-styling
  - Extract theme, components and vendor CSS separately
  - Check that vendor CSS hash doesn't change


## Ideas or possible research lines

- `[COSMETIC]` "3D" box-shadow buttons Material Design style
- `[FEATURE]` `[API]` `[APP]` `[...]` Microphone/MIDI/keyboard/mouse input
- `[FEATURE]` `[APP]` Offline/AppCache
- `[FEATURE]` `[APP]` Mobile app manifest
- `[FEATURE]` `[APP]` `[API]` `[COMPILER]` Declare sliders and other controls in
  scripts, which the user can control to affect sound/constants in real time
- `[FEATURE]` `[APP]` `[API]` `[COMPILER]` Static plots
  - Ability to plot arbitrary 2D data, formulas, etc.
  - Helpers for filter frequency response, FFT, etc.
- `[FEATURE]` `[APP]` [Visualization](https://jsfiddle.net/fqgn632s/11/)
  - Wave
  - FFT
  - XY
- `[INTERNAL]` `[PLAYER]` Test alternate compiling/playing methods (if faster or
  more responsive)
  - `eval`
  - Premaking buffers via Workers
  - Script tag
  - ...
- `[COSMETIC]` `[APP]` Make responsive (adjust font size, element positions, etc.)
- `[COSMETIC]` `[PLAYER]` https://reactify.github.io/react-player-controls/
- `[COSMETIC]` `[EDITOR]` Custom scrollbars (https://github.com/ajaxorg/ace/issues/869)
- `[FEATURE]` `[EDITOR]` History state might have low storage limits, fall back
  to `localStorage` with large files?
  - Maybe limit undo length too?
- `[FEATURE]` `[EDITOR]` REPL
- `[FEATURE]` `[EDITOR]` Save/load code from Gist (+ link generation)
- `[FEATURE]` `[EDITOR]` Work as a git repository, maybe even link with GitHub
- `[FEATURE]` `[EDITOR]` [Enable ACE worker but with custom rules](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js)
- `[FEATURE]` `[EDITOR]` Detect tab settings from buffer
- `[FEATURE]` `[EDITOR]` Remove trailing whitespace
- `[FEATURE]` `[EDITOR]` [Continue comments](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js)
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
- `[FEATURE]` `[MUSIKA]` `[FILTER]` Equalizer
- `[FEATURE]` `[MUSIKA]` `[FILTER]` Delay
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Reverb](http://www.earlevel.com/main/1997/01/19/a-bit-about-reverb/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Synth filters](http://www.earlevel.com/main/category/synthesizers/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [One pole filter](http://www.earlevel.com/main/2012/12/15/a-one-pole-filter/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Windowed sinc filter](http://www.earlevel.com/main/category/digital-audio/filters/fir-filters/) (for oversampling)
- `[FEATURE]` `[MUSIKA]` Buffers
- `[FEATURE]` GLSL Backend
- `[RESEARCH]` [Denormal numbers](http://cmc.music.columbia.edu/music-dsp/musicdspFAQ.html#denormals). Maybe move to integers? Or at least allow it. They
  might be faster anyways.
- `[RESEARCH]` [Ring modulation](http://cmc.music.columbia.edu/music-dsp/musicdspFAQ.html#ringmod)

### Internal

- Google Closure optimization
- Consider replacing Ace with Atom
- CDN vs. vendor chunk
  - Move vendor libraries to CDN instead of `vendor` chunk (maybe alternative
    build mode?)
  - Font Awesome is being used from CDN... Webpack it as vendor css/font?
    Include locally but don't bundle? Leave it on CDN?
- Babel Runtime + [Transform](https://babeljs.io/docs/plugins/transform-runtime/)
- I'm importing the full Font Awesome instead of only the few icons I need
- http://survivejs.com/webpack/building-with-webpack/eliminating-unused-css/
- http://survivejs.com/webpack/building-with-webpack/analyzing-build-statistics/
- [CSS modules](http://survivejs.com/webpack/loading-assets/loading-styles/)
- http://survivejs.com/webpack/advanced-techniques/linting/
- http://survivejs.com/webpack/advanced-techniques/authoring-packages/
- http://survivejs.com/webpack/advanced-techniques/configuring-react/
  - react-lite
  - TypeScript
  - Flow
