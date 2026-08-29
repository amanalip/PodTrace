import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagramLegend } from './DiagramLegend.tsx';
import { useAppStore } from '../../store/index.ts';

describe('DiagramLegend', () => {
  beforeEach(() => {
    useAppStore.setState({ isLegendOpen: false });
  });

  it('renders legend toggle button', () => {
    render(<DiagramLegend />);
    expect(screen.getByRole('button', { name: /open diagram legend/i })).toBeInTheDocument();
    expect(screen.queryByText('Node Status')).not.toBeInTheDocument();
  });

  it('opens and closes legend card on toggle click', () => {
    render(<DiagramLegend />);
    const toggleBtn = screen.getByRole('button', { name: /open diagram legend/i });

    fireEvent.click(toggleBtn);
    expect(useAppStore.getState().isLegendOpen).toBe(true);
    expect(screen.getByText('Node Status')).toBeInTheDocument();
    expect(screen.getByText('Edge Status')).toBeInTheDocument();
    expect(screen.getByText('Error / Failed flow')).toBeInTheDocument();
    expect(screen.getByText('Warning / Pending flow')).toBeInTheDocument();
    expect(screen.getByText('Zone Boundaries')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close diagram legend/i });
    fireEvent.click(closeBtn);
    expect(useAppStore.getState().isLegendOpen).toBe(false);
  });
});
