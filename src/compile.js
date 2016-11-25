import { parse } from 'acorn'

import * as Musika from 'Musika'

export function tryParseStack(stack) {
  try {
    let [fileName, lineNumber, columnNumber] = stack
      .split('\n')[1]
      .split('), ')[1]
      .slice(0, -1)
      .split(':')

    let row = parseInt(lineNumber - 3)
    let column = parseInt(columnNumber)

    return {fileName, row, column}
  } catch (e) {
    return {}
  }
}

export function tryParseException(e) {
  let {message, name, stack} = e
  let {fileName, row, column} = tryParseStack(stack)

  if (e.fileName) fileName = e.fileName
  if (e.lineNumber) row = e.lineNumber
  if (e.columnNumber) column = e.columnNumber

  return { name, message, fileName, row, column, e }
}

function parseAcornException(e, source) {
  let {message, name, loc: {line, column}} = e
  return { name, message, fileName: undefined, row: (line - 1), column, e }
}

export default function compile(source, sampleRate) {
  // Check for syntax errors - JavaScript doesn't provide error location otherwise
  const fnString = `(Musika, sampleRate, setLength) => {${source}\n}`
  try {
    parse(fnString)
  } catch(e) {
    return {error: parseAcornException(e, fnString)}
  }

  // Compile fn builder
  let builder
  try {
    builder = new Function('Musika', 'sampleRate', 'setLength', source)
  } catch (e) {
    return {error: tryParseException(e)}
  }

  // Run fn builder
  let length, fn
  try {
    fn = builder(Musika, sampleRate, l => length = l)
  } catch(e) {
    return {error: tryParseException(e)}
  }

  // Run fn dummy with t=0 to check for basic errors
  try {
    fn(0)
  } catch(e) {
    console.log('dummy failed')
    return {error: tryParseException(e)}
  }

  return {builder, length, fn}
}
