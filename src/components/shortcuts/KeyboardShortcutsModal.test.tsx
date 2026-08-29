import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal.tsx';
import { useAppStore } from '../../store/index.ts';

describe('KeyboardShortcutsModal', () => {
  beforeEach(() => {
    useAppStore.setState({ isShortcutsOpen: false });
  });

  it('does not render when isShortcutsOpen is false', () => {
    render(<KeyboardShortcutsModal />);
    expect(screen.queryByTestId('shortcuts-modal')).not.toBeInTheDocument();
  });

  it('renders shortcuts list when isShortcutsOpen is true and closes via button', () => {
    useAppStore.setState({ isShortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    expect(screen.getByTestId('shortcuts-modal')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Play / Pause lifecycle animation')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close shortcuts dialog');
    fireEvent.click(closeBtn);
    expect(useAppStore.getState().isShortcutsOpen).toBe(false);
  });

  it('closes when overlay is clicked', () => {
    useAppStore.setState({ isShortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    const overlay = screen.getByTestId('shortcuts-modal-overlay');
    fireEvent.click(overlay);
    expect(useAppStore.getState().isShortcutsOpen).toBe(false);
  });
});
