/**
 * Convert seconds to a MM:SS string.
 *
 * @param totalSecs The number of seconds.
 * @returns A string in the format MM:SS.
 */
export function toMinSecs(totalSecs: number): string {
  if (isNaN(totalSecs) || !isFinite(totalSecs)) {
    return 'NaN:NaN';
  }

  const absoluteSecs = Math.abs(totalSecs);

  const mins = Math.floor(absoluteSecs / 60);
  const secs = Math.floor(absoluteSecs % 60);

  return `${totalSecs < 0 ? '-' : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
