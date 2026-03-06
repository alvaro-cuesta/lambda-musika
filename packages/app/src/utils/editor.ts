import type { Ace } from 'ace-builds';

export type EditorSerialState = {
  source: string;
  cursor: Ace.Position;
  undo: object;
};

function isAcePosition(value: unknown): value is Ace.Position {
  if (typeof value !== 'object' || value === null) return false;
  if (!('row' in value) || typeof value.row !== 'number') return false;
  if (!('column' in value) || typeof value.column !== 'number') return false;
  return true;
}

export function isEditorSerialState(
  value: unknown,
): value is EditorSerialState {
  if (typeof value !== 'object' || value === null) return false;
  if (!('source' in value) || typeof value.source !== 'string') return false;
  if (!('cursor' in value) || !isAcePosition(value.cursor)) return false;
  if (
    !('undo' in value) ||
    typeof value.undo !== 'object' ||
    value.undo === null
  )
    return false;
  return true;
}
