# Lambda Musika TODO

## Critical

- Syntax errors are sometimes still stuck when they have been backed up into history state
- `[API]` Module-based scripts
- `[PLAYER]` Input time is completely wrong and has AM/PM in english locales (lol)

## Features

- `[APP]` Settings panel (e.g. editor font size, remember to store in `localStorage`!)
- `[API]` `[EDITOR]` Widgets in scripts, which the user can control to affect sound/constants in real time
  - Slider
  - Spinner (like `<input type="number">`)
- `[APP]` Share via Gist / Pastebin / 0x0.st / Hastebin / URL param?
  - Discussed in https://chatgpt.com/c/68bb7aa5-c2c8-8333-bd34-f512faefe94d
- `[APP]` Save as (allow right-click save-as on save button?)
- `[RENDERER]` Quantization. E.g. currently 8bit with the default script sounds terrible, very aliased
  - More quantization methods (currently truncating)
  - Maybe we should just `.round` to avoid DC bias towards -1 (but requires to first truncate to `[-1, +1]`)
  - [Dithering](http://www.earlevel.com/main/category/digital-audio/dither-digital-audio/)
  - Clamping?
- `[PLAYER]` Hotkeys for time-seeking
- `[PLAYER]` Volume slider
- `[API]` `[PLAYER]` `[RENDERER]` Musika scripts with Mono output

## Bugs

- `[PLAYER]` TimeSeeker maxes at 23:59 (HH:MM) due to using `<input type="time">`
- `[PLAYER]` Sound clicks on play/pause/update/seek

## Cosmetic

- `[PLAYER]` VU meter + peak hold indicator

## Chores

- `[APP]` Vite PWA
- `[APP]` Offline service worker
- `[EDITOR]` Replace Ace with Monaco?
- `[EDITOR]` Have IntelliSense (especially for Musika library!)

---

# Old TODO, not yet cleaned up

## 0.6.0

- `[API]` `[MUSIKA]` popping_wip example was bugged: since you can seek time, `t` is non-monotonic, which made the state invalid. Is this a flaw of the API?

  Should the user not assume `t` is monotonic? Maybe some kind of events?

  Another instance: biquad filters became unstable because of `t` not being
  monotonic.

- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Log-to-Linear function and viceversa (for linear parameters into freqs and such)
  - Also for amplitude? I.e. work with decibels
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` More interpolations for Attack/release envelopes
  - Linear
  - Hermite
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` [ADSR Envelope](http://www.earlevel.com/main/category/digital-audio/oscillators/envelope-generators/?orderby=date&order=ASC)
- `[API]` `[MUSIKA]` `[MUSIKA-ENVELOPE]` Should inv envelopes actually be logarithmic?
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Chordify signals (given an osc constructor,
  instance several and mix)
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Randomization helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Timing helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Compositional helpers
- `[API]` `[MUSIKA]` `[MUSIKA-MUSIC]` Arpeggiator
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Memoization helper
- `[API]` `[MUSIKA]` `[MUSIKA-UTIL]` Rate limiting helper (e.g. for control rates)

## 1.0.0

- `[FEATURE]` `[COSMETIC]` `[APP]` Some kind of help/README/intro/tutorial/documentation of Musika
- `[TODO]` `[MUSIKA]` Documentation
  - Add missing comments
  - Static documentation generation

## 1.0.x

- `[BUG]` `[APP]` Make app accessible (make sure to actually _try_ the app)
- `[TODO]` [Build librar(y/ies) as UMD package(s)](http://survivejs.com/webpack/loading-assets/formats-supported/#umd to be used outside of the DAW as a regular JavaScript library)
- `[TODO]` Publish to NPM

## 2.0.0

- `[API]` `[PLAYER]` `[RENDERER]` Using `t` as DSP time variable is awkward
  - Abstraction is leaking everywhere (e.g. filters don't work with time, only samples)
  - Possible solution: work with samples and `dt` instead
  - Problem: `t` is still useful in other situations (e.g. envelopes)

## Ideas or possible research lines

- `[SCRIPTS]` Use strict mode?
- `[COSMETIC]` "3D" box-shadow buttons Material Design style
- `[FEATURE]` `[API]` `[APP]` `[...]` Microphone/MIDI/keyboard/mouse input
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
- `[FEATURE]` `[EDITOR]` History state might have low storage limits, fall back to `localStorage` with large files?
  - Maybe limit undo length too?
- `[FEATURE]` `[EDITOR]` Work as a git repository (a-la CodeSandbox), maybe even link with GitHub
- `[FEATURE]` `[EDITOR]` [Enable ACE worker but with custom rules](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js)
- `[FEATURE]` `[EDITOR]` Detect tab settings from buffer
- `[FEATURE]` `[EDITOR]` Remove trailing whitespace
- `[FEATURE]` `[EDITOR]` [Continue comments](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js)
- `[FEATURE]` `[EDITOR]` `[COMPILER]` Multiple files/tabs
- `[FEATURE]` `[COMPILER]` Import Gists, JS modules by URL, or other sources of functions (for custom libraries)
- `[FEATURE]` `[APP]` `[EDITOR]` Slider when double-clicking numerical values in editor
- `[FEATURE]` `[RENDERER]` MP3/OGG/Opus/FLAC?
- `[API]` `[MUSIKA]` Make the API more functional by taking Sin(), Constant(), etc. as parameters... i.e. take functions instead of values (easier composition)
  - Function calls might be expensive, leave it to the user?
- `[API]` `[MUSIKA]` Maybe use object options instead of parameters (for easier composition of functions)
  - Objects might be expensive, leave it to the user?
- `[FEATURE]` `[MUSIKA]` `[FILTER]` Equalizer
- `[FEATURE]` `[MUSIKA]` `[FILTER]` Delay
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Reverb](http://www.earlevel.com/main/1997/01/19/a-bit-about-reverb/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Synth filters](http://www.earlevel.com/main/category/synthesizers/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [One pole filter](http://www.earlevel.com/main/2012/12/15/a-one-pole-filter/)
- `[FEATURE]` `[MUSIKA]` `[FILTER]` [Windowed sinc filter](http://www.earlevel.com/main/category/digital-audio/filters/fir-filters/) (for oversampling)
- `[FEATURE]` `[MUSIKA]` Buffers
- `[FEATURE]` `[MUSIKA]` Samples
- `[RESEARCH]` [Denormal numbers](http://cmc.music.columbia.edu/music-dsp/musicdspFAQ.html#denormals). Maybe move to integers? Or at least allow it. They might be faster anyways.
- `[RESEARCH]` [Ring modulation](http://cmc.music.columbia.edu/music-dsp/musicdspFAQ.html#ringmod)
