import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressTracker } from './ProgressTracker.tsx';
import { useAppStore } from '../../store/index.ts';

describe('ProgressTracker', () => {
  beforeEach(() => {
    useAppStore.setState({
      completedScenarioIds: [],
    });
  });

  it('renders initial 0% progress', () => {
    render(<ProgressTracker />);
    expect(screen.getByText(/0\/15 \(0%\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar-fill')).toHaveStyle({ width: '0%' });
  });

  it('updates progress bar when scenarios are completed', () => {
    useAppStore.setState({
      completedScenarioIds: ['crashloopbackoff', 'imagepullbackoff', 'oomkilled'],
    });

    render(<ProgressTracker />);
    expect(screen.getByText(/3\/15 \(20%\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar-fill')).toHaveStyle({ width: '20%' });
  });

  it('correctly rounds percentage integers for arbitrary completed counts', () => {
    useAppStore.setState({
      completedScenarioIds: ['crashloopbackoff'],
    });

    render(<ProgressTracker />);
    expect(screen.getByRole('region', { name: /troubleshooting scenario progress/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText(/1\/15 \(7%\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar-fill')).toHaveStyle({ width: '7%' });
  });

  it('renders All Solved milestone badge when 100% completed', () => {
    const allIds = Array.from({ length: 15 }, (_, i) => `sc-${i}`);
    useAppStore.setState({
      completedScenarioIds: allIds,
    });

    render(<ProgressTracker />);
    expect(screen.getByTestId('all-solved-badge')).toHaveTextContent('All Solved!');
  });
});
