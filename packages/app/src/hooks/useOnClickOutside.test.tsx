// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useOnClickOutside } from './useOnClickOutside.js';

function TestComponent({
  callback,
  eventType = 'click',
}: {
  callback: ((event: MouseEvent) => void) | null;
  eventType?: 'click' | 'mousedown';
}) {
  const insideRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(insideRef, callback, eventType);

  return (
    <>
      <div
        data-testid="inside"
        ref={insideRef}
      >
        inside
      </div>
      <div data-testid="outside">outside</div>
    </>
  );
}

describe('useOnClickOutside', () => {
  it('calls callback when clicking outside', () => {
    const callback = vi.fn();

    render(<TestComponent callback={callback} />);

    fireEvent.click(screen.getByTestId('inside'));
    fireEvent.click(screen.getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('supports custom mousedown event type', () => {
    const callback = vi.fn();

    render(
      <TestComponent
        callback={callback}
        eventType="mousedown"
      />,
    );

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does nothing when callback is null', () => {
    render(<TestComponent callback={null} />);

    fireEvent.click(screen.getByTestId('outside'));
  });
});
