/**
 * Generates a random string ID.
 * @returns A random string ID.
 */
export function getRandomId(): string {
  return crypto.randomUUID();
}
