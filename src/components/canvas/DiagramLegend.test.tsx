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

  it('opens and closes legend card on toggle click with ARIA attributes', () => {
    render(<DiagramLegend />);
    const toggleBtn = screen.getByTestId('diagram-legend-toggle-btn');
    expect(toggleBtn).toHaveAttribute('aria-controls', 'diagram-legend-card');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleBtn);
    expect(useAppStore.getState().isLegendOpen).toBe(true);
    expect(screen.getByRole('region', { name: /diagram status and boundary legend/i })).toBeInTheDocument();
    expect(screen.getByText('Node Status')).toBeInTheDocument();
    expect(screen.getByText('Edge Status')).toBeInTheDocument();
    expect(screen.getByText('Error / Failed flow')).toBeInTheDocument();
    expect(screen.getByText('Warning / Pending flow')).toBeInTheDocument();
    expect(screen.getByText('Zone Boundaries')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close diagram legend/i });
    expect(closeBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(closeBtn);
    expect(useAppStore.getState().isLegendOpen).toBe(false);
  });

  it('renders node status descriptions when open', () => {
    useAppStore.setState({ isLegendOpen: true });
    render(<DiagramLegend />);

    expect(screen.getByText('Idle (waiting)')).toBeInTheDocument();
    expect(screen.getByText('Active (processing step)')).toBeInTheDocument();
    expect(screen.getByText('Success / Running')).toBeInTheDocument();
    expect(screen.getByText('Pending / Warning')).toBeInTheDocument();
    expect(screen.getByText('Error / Failed')).toBeInTheDocument();
  });

  it('renders zone boundary descriptions when open', () => {
    useAppStore.setState({ isLegendOpen: true });
    render(<DiagramLegend />);

    expect(screen.getByText('Local Workstation')).toBeInTheDocument();
    expect(screen.getByText('Control Plane')).toBeInTheDocument();
    expect(screen.getByText('Worker Node')).toBeInTheDocument();
    expect(screen.getByText('Namespace Scope')).toBeInTheDocument();
  });

  it('closes legend when Escape key is pressed', () => {
    useAppStore.setState({ isLegendOpen: true });
    render(<DiagramLegend />);

    expect(screen.getByText('Node Status')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useAppStore.getState().isLegendOpen).toBe(false);
  });
});
