import type { StereoRenderer, Time } from '@lambda-musika/audio';
import * as Musika from '@lambda-musika/musika';
import { parse } from 'acorn';
import {
  parseAcornException,
  tryParseException,
  type AcornException,
  type ExceptionInfo,
} from './exception.js';
import { extractMeta, type StereoRendererMeta } from './metadata.js';

const ACORN_ECMA_VERSION = 2023;

type StereoRendererBuilder = (
  Musika: typeof import('@lambda-musika/musika'),
  sampleRate: number,
  console: Console,
  exports: Record<string | number | symbol, unknown>,
) => void;

const GLOBALS = ['Musika', 'sampleRate', 'console', 'exports'];

export type CompileResult =
  | {
      type: 'success';
      builder: StereoRendererBuilder;
      render: StereoRenderer;
      length: number | null;
      meta: StereoRendererMeta;
      warnings: ExceptionInfo[];
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

  // Compile renderer builder
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

  // Run renderer builder
  const exports: Record<string | number | symbol, unknown> = {};
  try {
    builder(Musika, sampleRate, console, exports);
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // Validate exports.render
  const renderRaw = exports['render'];
  if (typeof renderRaw !== 'function') {
    return {
      type: 'error' as const,
      error: {
        name: 'InvalidExportError',
        message: 'Expected export "render" to be a function',
        fileName: '<unknown file>',
        row: 0,
        column: 0,
        e: null,
      },
    };
  }
  // We will have to assume the type here since we can't really typecheck the function args/return type
  const render = renderRaw as StereoRenderer;

  // Validate exports.length
  const length: unknown = exports['length'] ?? null;
  if (typeof length !== 'number' && length !== null) {
    return {
      type: 'error' as const,
      error: {
        name: 'InvalidExportError',
        message: 'Expected export "length" to be a number, null, or undefined',
        fileName: '<unknown file>',
        row: 0,
        column: 0,
        e: null,
      },
    };
  }

  // Run render fn with dummy t=0, t=length/2, t=length to check for basic errors
  try {
    render(0 as Time);
    if (length) {
      render((length / 2) as Time);
      render(length as Time);
    } else {
      render(10 as Time); // Unknown length, try 10 just in case
    }
  } catch (e) {
    return { type: 'error' as const, error: tryParseException(e) };
  }

  // Validate exports.meta
  const { meta, warnings: metaWarnings } = extractMeta(exports['meta']);
  const warnings = metaWarnings.map((warning) => ({
    name: 'MetadataWarning',
    message: warning.message,
    fileName: '<metadata>',
    row: 0,
    column: 0,
    e: null,
  }));

  return {
    type: 'success' as const,
    builder,
    render,
    length,
    meta,
    warnings,
  };
}
