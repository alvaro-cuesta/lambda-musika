# Lambda Musika - The functional DAW

A JavaScript DAW that emphasizes functions as its core building block. In practice,
a realtime audio scripting language and batteries-included DSP library, running
on the web.

Keep in mind JavaScript is not the best language for CPU-intensive tasks, so
performance will be limited.

On the other hand, it runs in your browser.

## Usage

A Musika script is just regular JS program:

- interpreted client side
- that returns a function `t => [l, r]`
- where `t` is time
- and `l` and `r` are output samples for the left and right channels in `[-1, 1]`
  range

For now there is no static documentation available, just dive in the source code
and learn form the [default song](src/components/App/default-song.js) and [other
examples](#examples).

##### - Available defines:

- `sampleRate`, current audio device sample rate.
- `setLength(secs)`, sets the total length of the song in seconds.
  - Used to seek using the time slider.
  - When omitted the time slider is disabled and the sound is played endlessly
    (useful for drone or procedural music).
- `Musika`, the [Musika library](lib/):
  - [Generator](lib/Generator.js) units
  - [Envelope](lib/Generator.js) functions
  - [Filter](lib/Filter/index.js) units
  - [Operator](lib/Operator.js) functions
  - [Music](lib/Music.js) helpers that aid with traditional composition.
  - [Util](lib/Util.js)

##### - Script skeleton:

```js
const {Generator, Envelope, Filter, Operator, Music, Util} = Musika

return t => [0, 0]
```

## Examples

##### - Binaural beat

```js
const {Generator} = Musika

const F = 79            // Base frequency
const DF = 4            // Beat frequency
const A = Math.SQRT1_2  // Amplitude

const oscL = Generator.Sin(), oscR = Generator.Sin()

return t => [oscL(F, t) * A, oscR(F + DF, t) * A]
```

##### - Filtered noise

```js
const {Filter} = Musika

const NoiseGen = () => {
  const A = Math.SQRT1_2  // Amplitude = 0.707
  const COEFF = Filter.Biquad.LP(400/sampleRate, Math.SQRT1_2)  // Cutoff = 400Hz, Q = 0.707

  const filter = Filter.Biquad()
  return () => filter(COEFF, Math.random() * A)
}

const noiseL = NoiseGen(), noiseR = NoiseGen()

return () => [noiseL(), noiseR()]
```

##### - Simple sea

```js
const {Generator, Filter} = Musika

const NoiseGen = () => {
  const A = Math.SQRT1_2  // Amplitude = 0.707

  const filter = Filter.Biquad()
  return cutoff => {
    let coeff = Filter.Biquad.LP(cutoff/sampleRate, Math.SQRT1_2)
    return filter(coeff, Math.random() * A)
  }
}

const noiseL = NoiseGen(), noiseR = NoiseGen()
const cutL = Generator.Sin(), cutR = Generator.Sin()

return t => [
  noiseL(300 + cutL(0.1, t) * 200),
  noiseR(300 + cutR(0.08, t) * 200),
]
```

## Development

- [Open tasks](TODO.md)
- Start a development server at `localhost:8888`:

```sh
npm run dev
```

- Build the application in the `build/` directory:

```sh
npm run build
```

## License

**ISC License (ISC)**

Copyright (c) 2016, Álvaro Cuesta [\<alvaro-cuesta@GitHub\>](http://github.com/alvaro-cuesta/)

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
