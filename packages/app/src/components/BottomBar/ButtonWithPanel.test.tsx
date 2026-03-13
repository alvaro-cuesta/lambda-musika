// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ButtonWithPanel } from './ButtonWithPanel.js';
import { Panel } from './Panel.js';

function PanelWithFocusableContent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ButtonWithPanel
      onClick={() => {
        setIsOpen((open) => !open);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      panel={
        isOpen ? (
          <Panel title="Test panel">
            <button type="button">Inside action</button>
          </Panel>
        ) : null
      }
      title="Open test panel"
      aria-label="Open test panel"
    >
      Open
    </ButtonWithPanel>
  );
}

describe('ButtonWithPanel', () => {
  function isPanelFocused(dialog: HTMLElement) {
    const activeElement = document.activeElement;

    return (
      activeElement !== null &&
      (activeElement === dialog ||
        activeElement.contains(dialog) ||
        dialog.contains(activeElement))
    );
  }

  it('focuses the panel when opened and returns focus to trigger when closed', () => {
    render(<PanelWithFocusableContent />);

    const trigger = screen.getByRole('button', { name: 'Open test panel' });
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Test panel' });

    expect(isPanelFocused(dialog)).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(document.activeElement).toBe(trigger);
  });
});
