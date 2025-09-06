/**
 * Downloads a Blob object as a file.
 *
 * @param filename The name of the file to download.
 * @param blob The Blob object to download.
 */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

type LoadFileAs = 'text' | 'dataURL' | 'arrayBuffer';

type LoadFileContent<T extends LoadFileAs> = T extends 'text'
  ? string
  : T extends 'dataURL'
    ? string
    : T extends 'arrayBuffer'
      ? ArrayBuffer
      : never;

/**
 * Prompts the user to select a file and reads its content as a string.
 *
 * @param accept The accept attribute for the file input element.
 * @returns A promise that resolves to the file content as a string, or null if no file was selected.
 */
export function loadFile<T extends 'text' | 'dataURL' | 'arrayBuffer'>(
  readAs: T,
  accept?: string,
): Promise<{ name: string; content: LoadFileContent<T> } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');

    input.type = 'file';

    if (accept !== undefined) {
      input.accept = accept;
    }

    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) {
        resolve(null);
        return;
      }

      const r = new FileReader();
      r.onloadend = (e) => {
        const content = e.target?.result;

        if (content === null || content === undefined) {
          resolve(null);
        } else {
          resolve({
            name: f.name,
            content: content as LoadFileContent<T>,
          });
        }
      };

      switch (readAs) {
        case 'text':
          r.readAsText(f);
          break;
        case 'dataURL':
          r.readAsDataURL(f);
          break;
        case 'arrayBuffer':
          r.readAsArrayBuffer(f);
          break;
      }
    };

    input.click();
  });
}
