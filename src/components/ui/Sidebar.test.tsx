import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar.tsx';
import { useAppStore } from '../../store/index.ts';

describe('Sidebar', () => {
  beforeEach(() => {
    useAppStore.setState({ activeSidebarTab: 'editor' });
  });

  it('renders tab buttons with appropriate ARIA attributes', () => {
    render(<Sidebar />);
    const editorTab = screen.getByRole('tab', { name: /editor/i });
    const scenariosTab = screen.getByRole('tab', { name: /scenarios/i });
    const conceptsTab = screen.getByRole('tab', { name: /concepts/i });

    expect(editorTab).toHaveAttribute('aria-selected', 'true');
    expect(scenariosTab).toHaveAttribute('aria-selected', 'false');
    expect(conceptsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('switches between tabs', () => {
    render(<Sidebar />);

    const conceptsTab = screen.getByRole('tab', { name: /concepts/i });
    fireEvent.click(conceptsTab);
    expect(useAppStore.getState().activeSidebarTab).toBe('concepts');
    expect(screen.getByTestId('concepts-list')).toBeInTheDocument();
    expect(screen.getByText('What is the API Server?')).toBeInTheDocument();

    const scenariosTab = screen.getByRole('tab', { name: /scenarios/i });
    fireEvent.click(scenariosTab);
    expect(useAppStore.getState().activeSidebarTab).toBe('scenarios');
    expect(screen.getByTestId('scenario-list')).toBeInTheDocument();
    expect(screen.getByText(/troubleshooting progress/i)).toBeInTheDocument();
  });

  it('filters concepts and clears search input with clear button', () => {
    render(<Sidebar />);

    const conceptsTab = screen.getByRole('tab', { name: /concepts/i });
    fireEvent.click(conceptsTab);

    const input = screen.getByTestId('concept-search-input');
    fireEvent.change(input, { target: { value: 'API Server' } });

    expect(screen.getByText('What is the API Server?')).toBeInTheDocument();

    const clearBtn = screen.getByTestId('clear-concept-search-btn');
    fireEvent.click(clearBtn);

    expect(input).toHaveValue('');
  });

  it('renders empty state when concept search has no matches and resets on click', () => {
    render(<Sidebar />);

    const conceptsTab = screen.getByRole('tab', { name: /concepts/i });
    expect(conceptsTab).toHaveAttribute('aria-controls', 'concepts-panel');
    fireEvent.click(conceptsTab);

    const input = screen.getByTestId('concept-search-input');
    fireEvent.change(input, { target: { value: 'nonexistent-concept-xyz' } });

    expect(screen.getByTestId('no-concepts-found')).toBeInTheDocument();
    expect(screen.getByText(/no concepts found/i)).toBeInTheDocument();

    const resetBtn = screen.getByTestId('reset-concept-search-btn');
    fireEvent.click(resetBtn);

    expect(screen.queryByTestId('no-concepts-found')).not.toBeInTheDocument();
    expect(screen.getByText('What is the API Server?')).toBeInTheDocument();
  });

  it('switches to editor tab when editor tab button is clicked', () => {
    useAppStore.setState({ activeSidebarTab: 'concepts' });
    render(<Sidebar />);

    const editorTab = screen.getByRole('tab', { name: /editor/i });
    fireEvent.click(editorTab);

    expect(useAppStore.getState().activeSidebarTab).toBe('editor');
  });
});
