import { describe, expect, it, vi } from 'vitest';
import { TypedEventTarget } from './events.js';

type TestEvents = {
  ping: { value: number };
  done: undefined;
};

describe('TypedEventTarget', () => {
  it('dispatches custom event detail for non-void payload', () => {
    const target = new TypedEventTarget<TestEvents>();
    const listener = vi.fn((event: CustomEvent<TestEvents['ping']>) => {
      expect(event.detail.value).toBe(7);
    });

    target.addEventListener('ping', listener);
    target.dispatchEvent('ping', { value: 7 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('dispatches Event for undefined payload', () => {
    const target = new TypedEventTarget<TestEvents>();
    const listener = vi.fn((event: Event) => {
      expect(event).toBeInstanceOf(Event);
    });

    target.addEventListener('done', listener);
    target.dispatchEvent('done', undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removeEventListener stops future notifications', () => {
    const target = new TypedEventTarget<TestEvents>();
    const listener = vi.fn();

    target.addEventListener('done', listener);
    target.dispatchEvent('done', undefined);
    target.removeEventListener('done', listener);
    target.dispatchEvent('done', undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
