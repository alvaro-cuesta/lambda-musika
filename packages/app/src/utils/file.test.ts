// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob, loadFile } from './file.js';

const originalFileReader = globalThis.FileReader;
const originalCreateObjectURL = (URL as { createObjectURL?: unknown })
  .createObjectURL;
const originalRevokeObjectURL = (URL as { revokeObjectURL?: unknown })
  .revokeObjectURL;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.FileReader = originalFileReader;

  if (originalCreateObjectURL === undefined) {
    Reflect.deleteProperty(URL, 'createObjectURL');
  } else {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreateObjectURL,
      writable: true,
    });
  }

  if (originalRevokeObjectURL === undefined) {
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  } else {
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevokeObjectURL,
      writable: true,
    });
  }
});

class MockFileReader {
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null;
  private readonly resultByMethod: Partial<
    Record<'text' | 'dataURL' | 'arrayBuffer', string | ArrayBuffer | null>
  >;

  constructor(
    resultByMethod: Partial<
      Record<'text' | 'dataURL' | 'arrayBuffer', string | ArrayBuffer | null>
    >,
  ) {
    this.resultByMethod = resultByMethod;
  }

  readAsText() {
    this.emit('text');
  }

  readAsDataURL() {
    this.emit('dataURL');
  }

  readAsArrayBuffer() {
    this.emit('arrayBuffer');
  }

  private emit(method: 'text' | 'dataURL' | 'arrayBuffer') {
    const result = this.resultByMethod[method] ?? null;
    this.onloadend?.({
      target: { result },
    } as ProgressEvent<FileReader>);
  }
}

function createMockInput(file: File | null): HTMLInputElement {
  const input = {
    type: '',
    accept: '',
    files: file === null ? [] : [file],
    onchange: null as ((ev: Event) => void) | null,
    click: () => {
      input.onchange?.(new Event('change'));
    },
  };

  return input as unknown as HTMLInputElement;
}

describe('downloadBlob', () => {
  it('creates a temporary object url and clicks download link', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const clickSpy = vi.fn();
    const link = {
      download: '',
      href: '',
      click: () => {
        clickSpy();
      },
    } as unknown as HTMLAnchorElement;

    const createObjectURLSpy = vi.fn(() => 'blob:mock');
    const revokeObjectURLSpy = vi.fn();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURLSpy,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURLSpy,
      writable: true,
    });

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return link;
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    downloadBlob('demo.txt', blob);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(link.download).toBe('demo.txt');
    expect(link.href).toBe('blob:mock');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');
  });
});

describe('loadFile', () => {
  it('returns null when no file is selected', async () => {
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        return createMockInput(null);
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    await expect(loadFile('text')).resolves.toBeNull();
  });

  it('reads text files and includes name', async () => {
    const file = new File(['abc'], 'demo.txt', { type: 'text/plain' });

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        return createMockInput(file);
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    globalThis.FileReader = class extends MockFileReader {
      constructor() {
        super({ text: 'abc' });
      }
    } as unknown as typeof FileReader;

    await expect(loadFile('text')).resolves.toEqual({
      name: 'demo.txt',
      content: 'abc',
    });
  });

  it('reads data URLs and array buffers', async () => {
    const file = new File(['abc'], 'demo.txt', { type: 'text/plain' });
    const arrayBuffer = new ArrayBuffer(4);

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        return createMockInput(file);
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    globalThis.FileReader = class extends MockFileReader {
      constructor() {
        super({
          dataURL: 'data:text/plain;base64,YWJj',
          arrayBuffer,
        });
      }
    } as unknown as typeof FileReader;

    await expect(loadFile('dataURL')).resolves.toEqual({
      name: 'demo.txt',
      content: 'data:text/plain;base64,YWJj',
    });

    await expect(loadFile('arrayBuffer')).resolves.toEqual({
      name: 'demo.txt',
      content: arrayBuffer,
    });
  });

  it('sets accept attribute on file input', async () => {
    const file = new File(['abc'], 'demo.txt', { type: 'text/plain' });
    const input = createMockInput(file);

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        return input;
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    globalThis.FileReader = class extends MockFileReader {
      constructor() {
        super({ text: 'abc' });
      }
    } as unknown as typeof FileReader;

    await loadFile('text', '.musika');
    expect(input.accept).toBe('.musika');
  });

  it('returns null for null FileReader result', async () => {
    const file = new File(['abc'], 'demo.txt', { type: 'text/plain' });
    const input = createMockInput(file);

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        return input;
      }

      throw new Error(`Unexpected tag in test: ${tagName}`);
    });

    globalThis.FileReader = class extends MockFileReader {
      constructor() {
        super({ text: null });
      }
    } as unknown as typeof FileReader;

    await expect(loadFile('text')).resolves.toBeNull();
  });
});
