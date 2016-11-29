# Lambda Musika — The functional DAW

https://alvaro-cuesta.github.io/lambda-musika/

A JavaScript DAW that emphasizes functions as its core building block. In practice,
a realtime audio scripting language and batteries-included DSP library, running
on the web.

Keep in mind JavaScript is not the best language for CPU-intensive tasks, so
performance will be limited.

On the other hand, it runs in your browser.

## Usage

A Musika script is just a regular JS script:

- interpreted client side
- that returns a function `t => [l, r]`
- where `t` is time
- and `l` and `r` are output samples for the left and right channels in `[-1, 1]`
  range

For now there is no static documentation available, just dive in the source code
and learn form the [default song](examples/default.js) and other [examples](examples/).

##### - Available defines:

- `sampleRate`, current audio device sample rate.
- `setLength(secs)`, sets the total length of the song in seconds.
  - Used to seek using the time slider.
  - When omitted the time slider is disabled and the sound is played endlessly
    (useful for drone or procedural music).
- `Musika`, the [Musika library](lib/Musika/):
  - [Generator](lib/Musika/Generator.js) units
  - [Envelope](lib/Musika/Generator.js) functions
  - [Filter](lib/Musika/Filter/index.js) units
  - [Operator](lib/Musika/Operator.js) functions
  - [Music](lib/Musika/Music.js) helpers that aid with traditional composition.
  - [Util](lib/Musika/Util.js)

##### - Script skeleton:

```js
const {Generator, Envelope, Filter, Operator, Music, Util} = Musika

return t => [0, 0]
```

## Development

- Start a development server at `localhost:8888`:

```sh
npm run dev
```

- Build the application in the `build/` directory:

```sh
npm run build
```

- See [open tasks](TODO.md)

## License

**ISC License (ISC)**

Copyright (c) 2016, Álvaro Cuesta [\<alvaro-cuesta@GitHub\>](http://github.com/alvaro-cuesta/)

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
