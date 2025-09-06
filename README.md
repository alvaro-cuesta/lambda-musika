<a id="lambda-musika-the-functional-daw"></a>

<h1><a href="https://lambda.cuesta.dev"><img src="./public/favicon.svg" width="24" height="24" /></a> Lambda Musika, the functional DAW</h1>

<p align="center">
  <a href="#lambda-musika-the-functional-daw">
    <img src="https://img.shields.io/github/package-json/v/alvaro-cuesta/lambda-musika" alt="Version" /></a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/alvaro-cuesta/lambda-musika" alt="License" /></a>
  <a href="https://github.com/alvaro-cuesta/lambda-musika/actions/workflows/ci.yml">
    <img src="https://github.com/alvaro-cuesta/lambda-musika/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/alvaro-cuesta/lambda-musika/issues">
    <img src="https://img.shields.io/github/issues/alvaro-cuesta/lambda-musika" alt="Issues" /></a>
  <a href="#development">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="https://pr.new/alvaro-cuesta/lambda-musika" alt="Start new PR in StackBlitz Codeflow">
    <img src="https://developer.stackblitz.com/img/start_pr_small.svg" /></a>
</p>

A **JavaScript DAW** that emphasizes **functions as its core building block**. In practice, a realtime audio scripting language and batteries-included DSP library, running on the web. Live-coding ready!

<p align="center">
  <a href="https://lambda.cuesta.dev"><img src="./public/favicon.svg" alt="Lambda Musika" width="128" height="128" /></a>
  <br />
  <b>Try it now on <a href="https://lambda.cuesta.dev">lambda.cuesta.dev</a>!</b>
</p>

> [!IMPORTANT]
> Keep in mind JavaScript is _not_ the best language for CPU-intensive tasks, so performance will be limited.
>
> On the other hand, it runs in your browser!

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
const { Generator, Envelope, Filter, Operator, Music, Util } = Musika;

return (t) => [0, 0];
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
