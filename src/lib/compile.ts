import { parse } from 'acorn';
import type { StereoRenderer, Time } from './audio.js';
import {
  type AcornException,
  type ExceptionInfo,
  parseAcornException,
  tryParseException,
} from './exception.js';
import * as Musika from './Musika/index.js';

const ACORN_ECMA_VERSION = 2023;

type StereoRendererBuilder = (
  Musika: typeof import('./Musika/index.js'),
  sampleRate: number,
  console: Console,
  setLength: (l: number) => void,
) => StereoRenderer;

export type CompileResult =
  | {
      type: 'infinite';
      builder: StereoRendererBuilder;
      fn: StereoRenderer;
      length: undefined;
    }
  | {
      type: 'with-length';
      builder: StereoRendererBuilder;
      fn: StereoRenderer;
      length: number;
    }
  | { type: 'error'; error: ExceptionInfo };

export function compile(source: string, sampleRate: number): CompileResult {
  // Check for syntax errors - JavaScript doesn't provide error location otherwise
  const fnString = `(Musika, sampleRate, setLength) => {${source}\n}`;
  try {
    parse(fnString, { ecmaVersion: ACORN_ECMA_VERSION, sourceType: 'script' });
  } catch (e) {
    return {
      type: 'error' as const,
      error: parseAcornException(e as AcornException, fnString),
    };
  }

  // Compile fn builder
  let builder: StereoRendererBuilder;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- we really do want to use eval here!
    builder = new Function(
      'Musika',
      'sampleRate',
      'console',
      'setLength',
      source,
    ) as StereoRendererBuilder;
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // Run fn builder
  let length: number | null = null;
  let fn: StereoRenderer;
  try {
    fn = builder(Musika, sampleRate, console, (l: number) => (length = l));
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // Run fn dummy with t=0, t=length/2, t=length to check for basic errors
  try {
    fn(0 as Time);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive... length could be changed via setLength from builder
    if (length) {
      fn((length / 2) as Time);
      fn(length as Time);
    } else {
      fn(10 as Time); // Unknown length, try 10 just in case
    }
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive... length could be changed via setLength from builder
  return length === null
    ? { type: 'infinite' as const, builder, fn, length: undefined }
    : { type: 'with-length' as const, builder, fn, length };
}
