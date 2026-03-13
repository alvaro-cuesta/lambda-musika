// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useSetting } from './useSetting.js';

const editorFontSizeKey = 'musika.settings.editorFontSize';
const backingStore = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return backingStore.size;
  },
  clear() {
    backingStore.clear();
  },
  getItem(key: string) {
    return backingStore.get(key) ?? null;
  },
  key(index: number) {
    return [...backingStore.keys()][index] ?? null;
  },
  removeItem(key: string) {
    backingStore.delete(key);
  },
  setItem(key: string, value: string) {
    backingStore.set(key, value);
  },
};

const originalLocalStorage = globalThis.localStorage;

describe('useSetting', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: localStorageMock,
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns default value when setting is missing', () => {
    const { result } = renderHook(() => useSetting('editorFontSize'));

    expect(result.current[0]).toBe(14);
  });

  it('returns stored value when present', () => {
    localStorage.setItem(editorFontSizeKey, JSON.stringify(18));

    const { result } = renderHook(() => useSetting('editorFontSize'));

    expect(result.current[0]).toBe(18);
  });

  it('falls back to default when storage value is invalid JSON', () => {
    localStorage.setItem(editorFontSizeKey, '{bad json');

    const { result } = renderHook(() => useSetting('editorFontSize'));

    expect(result.current[0]).toBe(14);
  });

  it('updates localStorage and hook value through setter', () => {
    const { result } = renderHook(() => useSetting('editorFontSize'));

    act(() => {
      result.current[1](22);
    });

    expect(localStorage.getItem(editorFontSizeKey)).toBe('22');
    expect(result.current[0]).toBe(22);
  });

  it('reacts to custom localstorage-update events for the same key', () => {
    const { result } = renderHook(() => useSetting('editorFontSize'));

    act(() => {
      localStorage.setItem(editorFontSizeKey, JSON.stringify(19));
      window.dispatchEvent(
        new CustomEvent('localstorage-update', {
          detail: {
            key: 'editorFontSize',
          },
        }),
      );
    });

    expect(result.current[0]).toBe(19);
  });
});
