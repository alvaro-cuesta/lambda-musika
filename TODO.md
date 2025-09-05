# Lambda Musika TODO

## 0.3.0

- `[PLAYER]` Replace `ScriptProcessor` with `AudioWorklet`
- `[EDITOR]` Hotkeys for time-seeking

## 0.4.0

- `[EDITOR]` Save as (allow right-click save-as on save button?)
- `[PLAYER]` Volume slider
- `[COSMETIC]` `[PLAYER]` VU meter
- `[SCRIPTS]` Use strict mode?
- `[API]` `[PLAYER]` `[RENDERER]` Musika scripts with Mono output
- `[EDITOR]` Widgets like sliders inline in the editor
- `[PLAYER]` TimeSeeker maxes at 23:59 (HH:MM)
- `[CHORE]` `[EDITOR]` Replace Ace with Monaco?
- `[FEATURE]` `[EDITOR]` Have IntelliSense for Musika library

## 0.5.x

- `[FEATURE]` `[RENDERER]` Quantization
  - More quantization methods (currently truncating)
  - [Dithering](http://www.earlevel.com/main/category/digital-audio/dither-digital-audio/)
  - Clamping?
- `[FEATURE]` `[RENDERER]` Dithering for quantization? Currently 8 bit is very noisy
- `[?]` `[RENDERER]` Handle big/little endian architectures (I don't remember
  what I meant with this task)

## 0.6.0

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

## 1.0.0

- `[BUG]` `[PLAYER]` Sound clicks on play/pause/update/seek
- `[FEATURE]` `[COSMETIC]` `[APP]` Some kind of help/README/intro/tutorial
- `[FEATURE]` `[COSMETIC]` `[EDITOR]` Visual feedback after commit (annotation?)
- `[TODO]` `[MUSIKA]` Documentation
  - Add missing comments
  - Static documentation generation

## 1.0.x

- `[BUG]` `[APP]` Make app accessible (make sure to actually _try_ the app)
- `[FEATURE]` `[RENDERER]` Render in background using web workers. Try [adapting
  to the number of cores](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency).
- `[BUG]` `[EDITOR]` Editor has a fixed size and can't be resized really small
- `[TODO]` [Build librar(y/ies) as UMD package(s)](http://survivejs.com/webpack/loading-assets/formats-supported/#umd to be used outside of the DAW as a regular JavaScript library)
- `[TODO]` Publish to NPM

## 2.0.0

- `[API]` `[PLAYER]` `[RENDERER]` Using `t` as DSP time variable is awkward
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only
    samples)
  - Possible solution: work with samples and `dt` instead
  - Problem: `t` is still useful in other situations (e.g. envelopes)

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
