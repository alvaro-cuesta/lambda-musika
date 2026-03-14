export function assertIsNever(value: never): never {
  throw new Error(`Expected never, but got ${String(value)}`);
}
