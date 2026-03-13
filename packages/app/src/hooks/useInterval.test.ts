// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInterval } from './useInterval.js';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs callback repeatedly with delay', () => {
    const callback = vi.fn();

    renderHook(() => {
      useInterval(callback, 100);
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not run callback when delay is null', () => {
    const callback = vi.fn();

    renderHook(() => {
      useInterval(callback, null);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('uses the latest callback after rerender', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ callback }: { callback: () => void }) => {
        useInterval(callback, 100);
      },
      {
        initialProps: { callback: first },
      },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ callback: second });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops interval when unmounted', () => {
    const callback = vi.fn();

    const { unmount } = renderHook(() => {
      useInterval(callback, 100);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
