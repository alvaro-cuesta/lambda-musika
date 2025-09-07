/**
 * Generates a random string ID.
 * @returns A random string ID.
 */
export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}
