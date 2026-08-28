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
});
