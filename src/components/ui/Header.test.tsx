import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header.tsx';
import { useAppStore } from '../../store/index.ts';

describe('Header', () => {
  it('renders branding title, landmark label, and action buttons', () => {
    render(<Header />);

    expect(screen.getByRole('banner', { name: /podtrace application header/i })).toBeInTheDocument();
    expect(screen.getByText('PodTrace')).toBeInTheDocument();
    expect(screen.getByText(/trace every step/i)).toBeInTheDocument();
    expect(screen.getByTestId('shortcuts-launcher-btn')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-launcher-btn')).toBeInTheDocument();
    expect(screen.getByTestId('header-share-btn')).toBeInTheDocument();
    expect(screen.getByTestId('header-export-btn')).toBeInTheDocument();
  });

  it('toggles color theme on click', () => {
    useAppStore.setState({ theme: 'dark' });
    render(<Header />);

    const themeBtn = screen.getByRole('button', { name: /toggle color theme/i });
    expect(themeBtn).toHaveTextContent(/light/i);

    fireEvent.click(themeBtn);
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('opens keyboard shortcuts modal when keys button is clicked', () => {
    useAppStore.setState({ isShortcutsOpen: false });
    render(<Header />);

    const shortcutsBtn = screen.getByTestId('shortcuts-launcher-btn');
    fireEvent.click(shortcutsBtn);
    expect(useAppStore.getState().isShortcutsOpen).toBe(true);
  });
});
