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

/**
 * Lines added automatically by the `Function` constructor which assembles a function in the following fashion:
 *
 * ```
 * `function anonymous(${args.join(",")}
 * ) {
 * ${functionBody}
 * }`;
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function#description
 */
const LINE_COUNT_ADDED_ABOVE_BY_FUNCTION_CONSTRUCTOR = 2;

/**
 * How many lines are added by us when we wrap the user code in a function.
 *
 * Currently we manually add one line ("use strict";)
 */
const LINE_COUNT_ADDED_ABOVE_BY_US = 1;

export const LINE_COUNT_ADDED_ABOVE =
  LINE_COUNT_ADDED_ABOVE_BY_FUNCTION_CONSTRUCTOR + LINE_COUNT_ADDED_ABOVE_BY_US;

type StereoRendererBuilder = (
  Musika: typeof import('./Musika/index.js'),
  sampleRate: number,
  console: Console,
  setLength: (l: number) => void,
) => StereoRenderer;

const GLOBALS = ['Musika', 'sampleRate', 'console', 'setLength'];

export type CompileResult =
  | {
      type: 'success';
      builder: StereoRendererBuilder;
      fn: StereoRenderer;
      length: number | null;
    }
  | {
      type: 'error';
      error: ExceptionInfo;
    };

export function compile(source: string, sampleRate: number): CompileResult {
  // Check for syntax errors - JavaScript doesn't provide error location otherwise
  // @todo This is currently not injecting "use strict", is not the same as `Function`s injection, etc. Unify.
  const fnString = `(${GLOBALS.join(', ')}) => {${source}\n}`;
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
      ...GLOBALS,
      `"use strict";
${source}
//# sourceURL=script.musika`,
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

  return { type: 'success' as const, builder, fn, length };
}
