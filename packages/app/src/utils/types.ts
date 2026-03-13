export function assertIsNever(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- allowed runtime error
  throw new Error(`Expected never, but got ${value}`);
}
