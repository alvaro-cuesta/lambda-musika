<a id="lambda-musika-the-functional-daw"></a>

<h1><a href="https://lambda.cuesta.dev"><img src="./packages/app/public/favicon.svg" width="24" height="24" /></a> Lambda Musika, the functional DAW</h1>

<p align="center">
  <a href="#lambda-musika-the-functional-daw">
    <img src="https://img.shields.io/github/package-json/v/alvaro-cuesta/lambda-musika?filename=packages/app/package.json" alt="Version" /></a>
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
  <a href="https://lambda.cuesta.dev"><img src="./packages/app/public/favicon.svg" alt="Lambda Musika" width="128" height="128" /></a>
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
- and `l` and `r` are output samples for the left and right channels in `[-1, 1]` range

For now there is no static documentation available, just dive in the source code and learn form the [default song](packages/app/src/examples/default.musika), other [examples](packages/app/src/examples/), or just browse the [Musika library](packages/musika/src/).

### Available defines:

- `sampleRate`, current audio device sample rate.
- `setLength(secs)`, sets the total length of the song in seconds.
  - Used to seek using the time slider.
  - When omitted the time slider is disabled and the sound is played endlessly (useful for drone or endless procedural music).
- `Musika`, the [Musika library](packages/musika/src/)

### Empty script skeleton:

```js
const { Generator, Envelope, Filter, Operator, Music, Util } = Musika;

return (t) => [0, 0];
```

## Development

Install [Node.js](https://nodejs.org), clone this repository and run this in the root of the project to install the required dependencies:

```sh
corepack enable
corepack install
pnpm install --frozen-lockfile
```

### Local development

Just run this to start a local development server and follow the instructions:

```sh
pnpm dev
```

### Lints

You should periodically run linters to ensure the code passes some basic checks:

```sh
pnpm lint
```

Or just let your IDE do the work with TypeScript/ESLint/Prettier integrations. These are automatically run as checks on GitHub Actions, but it's better if you keep lints up to date as you code!

### Tests

Run all package tests from the workspace root:

```sh
pnpm test
```

These are automatically run as checks on GitHub Actions, but it's better if you keep tests up to date as you code!

### Things to do

- See [`TODO.md`](TODO.md) for outstanding general tasks.
- See [open issues](https://github.com/alvaro-cuesta/lambda-musika/issues).
- Do a global search for `@todo` in the code.

## Production build

Run this to serve the application in production mode:

```sh
pnpm build
pnpm preview
```
