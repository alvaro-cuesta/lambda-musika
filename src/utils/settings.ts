import { useCallback, useRef, useSyncExternalStore } from 'react';

// Needed because localStorage events don't fire in the same tab
const CUSTOM_STORAGE_EVENT_KEY = 'localstorage-update';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- extending existing interface
  interface WindowEventMap {
    'localstorage-update': CustomEvent<{ key: string }>;
  }
}

export type Settings = {
  editorFontSize: number;
};

const DEFAULT_SETTINGS: Settings = {
  editorFontSize: 14,
};

function getSettingsKey(key: keyof Settings): string {
  return `musika.settings.${key}`;
}

export function getSetting(key: keyof Settings): Settings[typeof key] {
  const v = localStorage.getItem(getSettingsKey(key));
  if (v === null) {
    return DEFAULT_SETTINGS[key];
  }

  try {
    return JSON.parse(v) as Settings[typeof key];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

export function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
) {
  localStorage.setItem(getSettingsKey(key), JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(CUSTOM_STORAGE_EVENT_KEY, {
      detail: { key },
    }) satisfies WindowEventMap['localstorage-update'],
  );
}

export function useSetting<K extends keyof Settings>(
  key: K,
): [Settings[K], (value: Settings[K]) => void] {
  const callbackRef = useRef<() => void>(null);

  const subscribe = useCallback(
    (callback: () => void) => {
      function handleStorageEvent(e: StorageEvent) {
        if (e.storageArea === localStorage && e.key === getSettingsKey(key)) {
          callback();
        }
      }

      function handleCustomStorageEvent(
        e: WindowEventMap['localstorage-update'],
      ) {
        if (e.detail.key === key) {
          callback();
        }
      }

      window.addEventListener('storage', handleStorageEvent);
      window.addEventListener(
        CUSTOM_STORAGE_EVENT_KEY,
        handleCustomStorageEvent,
      );

      return () => {
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener(
          CUSTOM_STORAGE_EVENT_KEY,
          handleCustomStorageEvent,
        );
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => getSetting(key),
    () => DEFAULT_SETTINGS[key],
  );

  const setValue = useCallback(
    (newValue: Settings[typeof key]) => {
      setSetting(key, newValue);
      callbackRef.current?.();
    },
    [key],
  );

  return [value, setValue];
}
