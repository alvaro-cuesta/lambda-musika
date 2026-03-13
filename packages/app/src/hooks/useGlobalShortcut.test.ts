// @vitest-environment jsdom

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGlobalShortcut, type ShortcutEvent } from './useGlobalShortcut.js';

describe('useGlobalShortcut', () => {
  it('calls shortcut callback and prevents default when shortcut matches', () => {
    const onShortcut = vi.fn();

    renderHook(() => {
      useGlobalShortcut(
        (event) => event.ctrlKey && event.key.toLowerCase() === 's',
        onShortcut,
      );
    });

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    });

    document.dispatchEvent(keydownEvent);

    expect(onShortcut).toHaveBeenCalledTimes(1);
    expect(keydownEvent.defaultPrevented).toBe(true);
  });

  it('does not call callback for non matching events', () => {
    const onShortcut = vi.fn();

    renderHook(() => {
      useGlobalShortcut(
        (event) => event.ctrlKey && event.key.toLowerCase() === 's',
        onShortcut,
      );
    });

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'x',
        ctrlKey: true,
      }),
    );

    expect(onShortcut).not.toHaveBeenCalled();
  });

  it('uses the latest predicate and callback after rerender', () => {
    const firstPredicate = vi.fn<(event: ShortcutEvent) => boolean>(
      () => false,
    );
    const secondPredicate = vi.fn<(event: ShortcutEvent) => boolean>(
      () => true,
    );
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { rerender } = renderHook(
      ({
        isShortcut,
        onShortcut,
      }: {
        isShortcut: (event: ShortcutEvent) => boolean;
        onShortcut: () => void;
      }) => {
        useGlobalShortcut(isShortcut, onShortcut);
      },
      {
        initialProps: {
          isShortcut: firstPredicate,
          onShortcut: firstCallback,
        },
      },
    );

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    rerender({
      isShortcut: secondPredicate,
      onShortcut: secondCallback,
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(firstPredicate).toHaveBeenCalledTimes(1);
    expect(secondPredicate).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
