import { parse, type Position } from 'acorn';
import * as Musika from './Musika/index.js';
import type { StereoRenderer, StereoSignal } from './audio.js';

const ACORN_ECMA_VERSION = 2023;

export type ExceptionInfo = {
  name: string;
  message: string;
  fileName: string;
  row: number;
  column: number;
  e: unknown;
};

function groupsToExceptionInfo(groups: {
  fileName: string;
  row: string;
  column: string;
}): Pick<ExceptionInfo, 'fileName' | 'row' | 'column'> {
  const { fileName, row: matchedRow, column: matchedColumn } = groups;
  const row = parseInt(matchedRow, 10) - 3; // -3 because lines are 1-based and we added 2 lines in the eval
  const column = parseInt(matchedColumn, 10) - 1; // -1 because columns are 1-based
  return { fileName, row, column };
}

// Example stack as of Chrome 140.0.7339.80
//
// ReferenceError: testingUndefined is not defined
//     at eval (eval at compile (http://localhost:5173/src/lib/compile.ts:43:15), <anonymous>:26:1)
//     at compile (http://localhost:5173/src/lib/compile.ts:50:10)
//     at http://localhost:5173/src/components/App.tsx?t=1757067401516:84:28
//     at http://localhost:5173/src/components/App.tsx?t=1757067401516:105:5
//     at HTMLDocument.handleKeyDown (http://localhost:5173/src/components/BottomBar.tsx?t=1757067394057:221:9)
function tryParseStackChrome(
  stack: string,
): Pick<ExceptionInfo, 'fileName' | 'row' | 'column'> | null {
  // Get first line after the error message, which is where the error was thrown
  const line = stack.split('\n')[1];
  if (!line) return null;

  // Get the file name, line number and column number from the line
  // First we try matching the "    at ... (..., ..., <fileName>:<line>:<column>)" format
  const matchEval =
    /^ {4}at .+ \(.+, (?<fileName>.+):(?<row>\d+):(?<column>\d+)\)$/.exec(line);
  if (matchEval)
    return groupsToExceptionInfo(
      matchEval.groups as { fileName: string; row: string; column: string },
    );

  // Then we try matching the "    at filename:line:column" format in case Chrome decides to change the format for evals
  const matchNoFn = /^ {4}at (?<fileName>.+):(?<row>\d+):(?<column>\d+)$/.exec(
    line,
  );
  if (matchNoFn)
    return groupsToExceptionInfo(
      matchNoFn.groups as { fileName: string; row: string; column: string },
    );

  // No match
  return null;
}

// Example stack as of Firefox 142.0.1
//
// anonymous@http://localhost:5173/src/lib/compile.ts?t=1757067439409 line 43 > Function:26:1
// compile@http://localhost:5173/src/lib/compile.ts?t=1757067439409:50:10
// App/handleUpdate<@http://localhost:5173/src/components/App.tsx?t=1757067485010:84:35
// App/handleExplicitUpdate<@http://localhost:5173/src/components/App.tsx?t=1757067485010:104:5
// <...snip...>
function tryParseStackFirefox(
  stack: string,
): Pick<ExceptionInfo, 'fileName' | 'row' | 'column'> | null {
  // Get first line after the error message, which is where the error was thrown
  const line = stack.split('\n')[0];
  if (!line) return null;

  // Get the file name, line number and column number from the line
  const match =
    /^.*@(?<fileName>.*):(?<lineNumber>\d+):(?<columnNumber>\d+)$/.exec(line);
  if (!match) return null;

  // as is safe because of the regex
  const { fileName, lineNumber, columnNumber } = match.groups as {
    fileName: string;
    lineNumber: string;
    columnNumber: string;
  };
  const row = parseInt(lineNumber, 10) - 3; // -3 because Firefox lines are 1-based and we added 2 lines in the eval
  const column = parseInt(columnNumber, 10) - 1; // -1 because Firefox columns are 1-based

  return { fileName, row, column };
}

export function tryParseStack(
  stack: string,
): Pick<ExceptionInfo, 'fileName' | 'row' | 'column'> {
  return (
    tryParseStackChrome(stack) ??
    tryParseStackFirefox(stack) ?? { fileName: '<unknown>', row: 0, column: 0 }
  );
}

export function tryParseException(e: unknown): ExceptionInfo {
  const exceptionInfo = {
    name: '<unnamed error>',
    message: '<no message>',
    fileName: '<unknown file>',
    row: 0,
    column: 0,
    e,
  };

  let stack: string | null = null;

  if (typeof e === 'object' && e !== null) {
    if ('name' in e && typeof e.name === 'string') exceptionInfo.name = e.name;
    if ('message' in e && typeof e.message === 'string')
      exceptionInfo.message = e.message;
    if ('stack' in e && typeof e.stack === 'string') stack = e.stack;
  }

  if (stack) {
    const parsed = tryParseStack(stack);
    exceptionInfo.fileName = parsed.fileName;
    exceptionInfo.row = parsed.row;
    exceptionInfo.column = parsed.column;
  }

  if (typeof e === 'object' && e !== null) {
    if ('fileName' in e && typeof e.fileName === 'string')
      exceptionInfo.fileName = e.fileName;
    if ('lineNumber' in e && typeof e.lineNumber === 'number')
      exceptionInfo.row = e.lineNumber - 3;
    if ('columnNumber' in e && typeof e.columnNumber === 'number')
      exceptionInfo.column = e.columnNumber - 1;
  }

  return exceptionInfo;
}

type AcornException = {
  message: string;
  name: string;
  loc: Position;
};

function parseAcornException(
  e: AcornException,
  _source: string,
): ExceptionInfo {
  const {
    message,
    name,
    loc: { line, column },
  } = e;
  return {
    name,
    message,
    fileName: '<unknown>',
    row: line - 1, // -1 because Acorn lines are 1-based
    column,
    e,
  };
}

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
  let fn: (t: number) => StereoSignal;
  try {
    fn = builder(Musika, sampleRate, console, (l: number) => (length = l));
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // Run fn dummy with t=0, t=length/2, t=length to check for basic errors
  try {
    fn(0);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive... length could be changed via setLength from builder
    if (length) {
      fn(length / 2);
      fn(length);
    } else {
      fn(10); // Unknown length, try 10 just in case
    }
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive... length could be changed via setLength from builder
  return length === null
    ? { type: 'infinite' as const, builder, fn, length: undefined }
    : { type: 'with-length' as const, builder, fn, length };
}
