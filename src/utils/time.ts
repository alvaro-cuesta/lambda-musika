/**
 * Convert seconds to a MM:SS string.
 *
 * @param totalSecs The number of seconds.
 * @returns A string in the format MM:SS.
 */
export function toMinsSecs(totalSecs: number, separator = ':'): string {
  if (isNaN(totalSecs) || !isFinite(totalSecs)) {
    return 'NaN:NaN';
  }

  const absoluteSecs = Math.abs(totalSecs);

  const sign = totalSecs < 0 ? '-' : '';
  const mins = Math.floor(absoluteSecs / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(absoluteSecs % 60)
    .toString()
    .padStart(2, '0');

  return `${sign}${mins}${separator}${secs}`;
}

export function dateToSortableString(date: Date): string {
  const yyyy = date.getFullYear().toString().padStart(4, '0');
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mi = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');

  return `${yyyy}${mo}${dd}${hh}${mi}${ss}`;
}
