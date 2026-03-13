// @vitest-environment jsdom

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLatest } from './useLatest.js';

describe('useLatest', () => {
  it('keeps ref.current in sync with latest value', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useLatest(value),
      {
        initialProps: { value: 1 },
      },
    );

    expect(result.current.current).toBe(1);

    rerender({ value: 42 });
    expect(result.current.current).toBe(42);
  });
});
