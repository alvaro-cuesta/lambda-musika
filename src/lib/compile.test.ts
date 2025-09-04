import { tryParseStack } from './compile.js';

describe('tryParseStack', () => {
  it('parses Chrome stack traces', () => {
    const stack = `ReferenceError: testingUndefined is not defined
    at eval (eval at compile (http://localhost:5173/src/lib/compile.ts:43:15), <anonymous>:26:1)
    at compile (http://localhost:5173/src/lib/compile.ts:50:10)
    at http://localhost:5173/src/components/App.tsx?t=1757067401516:84:28
    at http://localhost:5173/src/components/App.tsx?t=1757067401516:105:5
    at HTMLDocument.handleKeyDown (http://localhost:5173/src/components/BottomBar.tsx?t=1757067394057:221:9)`;

    const parsed = tryParseStack(stack);
    expect(parsed).toEqual({
      fileName: '<anonymous>',
      row: 23,
      column: 0,
    });
  });

  it('parses Firefox stack traces', () => {
    const stack = `anonymous@http://localhost:5173/src/lib/compile.ts?t=1757067439409 line 43 > Function:26:1
compile@http://localhost:5173/src/lib/compile.ts?t=1757067439409:50:10
App/handleUpdate<@http://localhost:5173/src/components/App.tsx?t=1757067485010:84:35
App/handleExplicitUpdate<@http://localhost:5173/src/components/App.tsx?t=1757067485010:104:5`;
    const parsed = tryParseStack(stack);
    expect(parsed).toEqual({
      fileName:
        'http://localhost:5173/src/lib/compile.ts?t=1757067439409 line 43 > Function',
      row: 23,
      column: 0,
    });
  });

  it('returns a fallback for unparseable stack traces', () => {
    const stack = `Some random error message
    at some random place (some random file:123:456)`;
    const parsed = tryParseStack(stack);
    expect(parsed).toEqual({
      fileName: '<unknown>',
      row: 0,
      column: 0,
    });
  });
});
