import { describe, expect, it } from 'vitest';
import { isEditorSerialState } from './editor.js';

describe('isEditorSerialState', () => {
  it('returns true for valid serialized editor state', () => {
    expect(
      isEditorSerialState({
        source: 'A4(440)',
        cursor: { row: 3, column: 12 },
        undo: {},
      }),
    ).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isEditorSerialState(null)).toBe(false);
    expect(
      isEditorSerialState({
        source: 123,
        cursor: { row: 0, column: 0 },
        undo: {},
      }),
    ).toBe(false);
    expect(
      isEditorSerialState({
        source: 'x',
        cursor: { row: '0', column: 0 },
        undo: {},
      }),
    ).toBe(false);
    expect(
      isEditorSerialState({
        source: 'x',
        cursor: { row: 0, column: 0 },
        undo: null,
      }),
    ).toBe(false);
  });
});
