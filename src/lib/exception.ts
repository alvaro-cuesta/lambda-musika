import type { Position } from 'acorn';
import { LINE_COUNT_ADDED_ABOVE } from './compile';

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
  const row = parseInt(matchedRow, 10) - LINE_COUNT_ADDED_ABOVE - 1; // -1 due to 1-based lines
  const column = parseInt(matchedColumn, 10) - 1; // -1 due to 1-based columns
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
  // First we try matching "    at eval (<fileName>:<line>:<column>)" format (named eval)
  const matchNamedEval =
    /^ {4}at eval \((?<fileName>.+):(?<row>\d+):(?<column>\d+)\)$/.exec(line);
  if (matchNamedEval) {
    return groupsToExceptionInfo(
      matchNamedEval.groups as {
        fileName: string;
        row: string;
        column: string;
      },
    );
  }

  // Then we try matching the "    at ... (..., ..., <fileName>:<line>:<column>)" format (unnamed eval)
  const matchUnnamedEval =
    /^ {4}at .+ \(.+, (?<fileName>.+):(?<row>\d+):(?<column>\d+)\)$/.exec(line);
  if (matchUnnamedEval)
    return groupsToExceptionInfo(
      matchUnnamedEval.groups as {
        fileName: string;
        row: string;
        column: string;
      },
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
  const row = parseInt(lineNumber, 10) - LINE_COUNT_ADDED_ABOVE - 1; // -1 due to 1-based lines
  const column = parseInt(columnNumber, 10) - 1; // -1 due to 1-based columns

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
    // These are only present in Firefox
    if ('fileName' in e && typeof e.fileName === 'string')
      exceptionInfo.fileName = e.fileName;
    if ('lineNumber' in e && typeof e.lineNumber === 'number')
      exceptionInfo.row = e.lineNumber - LINE_COUNT_ADDED_ABOVE - 1; // -1 due to 1-based lines
    if ('columnNumber' in e && typeof e.columnNumber === 'number')
      exceptionInfo.column = e.columnNumber - 1; // -1 due to 1-based columns
  }

  return exceptionInfo;
}

export type AcornException = {
  message: string;
  name: string;
  loc: Position;
};

export function parseAcornException(
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
    row: line - 1, // -1 due to 1-based lines
    column, // columns in Acorn are already 0-based
    e,
  };
}
