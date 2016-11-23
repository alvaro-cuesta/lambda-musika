import * as Musika from 'Musika'

function tryParseStack(stack) {
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

function tryParseException(e) {
  let {message, name, stack} = e
  let {fileName, row, column} = tryParseStack(stack)

  if (e.fileName) fileName = e.fileName
  if (e.lineNumber) row = e.lineNumber
  if (e.columnNumber) column = e.columnNumber

  return { name, message, fileName, row, column, e }
}

export default function compile(source, sampleRate) {
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

  return {builder, length, fn}
}
