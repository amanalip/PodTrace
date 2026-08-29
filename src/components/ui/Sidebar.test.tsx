import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar.tsx';
import { useAppStore } from '../../store/index.ts';

describe('Sidebar', () => {
  beforeEach(() => {
    useAppStore.setState({ activeSidebarTab: 'editor' });
  });

  it('renders tab buttons', () => {
    render(<Sidebar />);
    expect(screen.getByRole('tab', { name: /editor/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /concepts/i })).toBeInTheDocument();
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
});
