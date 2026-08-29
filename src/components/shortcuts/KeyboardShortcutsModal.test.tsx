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

  it('filters shortcuts by query and closes on Escape key', () => {
    useAppStore.setState({ isShortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    const filterInput = screen.getByTestId('shortcuts-filter-input');
    fireEvent.change(filterInput, { target: { value: 'Speed' } });

    expect(screen.getByText(/Decrease \/ Increase playback speed/i)).toBeInTheDocument();
    expect(screen.queryByText('Play / Pause lifecycle animation')).not.toBeInTheDocument();

    const clearBtn = screen.getByTestId('clear-shortcuts-filter-btn');
    fireEvent.click(clearBtn);
    expect(screen.getByText('Play / Pause lifecycle animation')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useAppStore.getState().isShortcutsOpen).toBe(false);
  });

  it('displays empty state when filter matches no shortcuts', () => {
    useAppStore.setState({ isShortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    const filterInput = screen.getByTestId('shortcuts-filter-input');
    fireEvent.change(filterInput, { target: { value: 'nonexistent-shortcut-xyz' } });

    expect(screen.getByText(/No shortcuts found matching/i)).toBeInTheDocument();
  });
});
