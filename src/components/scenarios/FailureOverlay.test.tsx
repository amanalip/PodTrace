import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FailureOverlay } from './FailureOverlay.tsx';
import { useAppStore } from '../../store/index.ts';
import { Scenario } from '../../scenarios/scenario-types.ts';

describe('FailureOverlay', () => {
  const mockScenario: Scenario = {
    id: 'sc-1',
    title: 'CrashLoopBackOff on Startup',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'The container crashes immediately with exit code 1.',
    yamlTemplate: '...',
    failureStep: 9,
    failureDetails: {
      errorType: 'CrashLoopBackOff',
      failingStep: 9,
      failingNodeId: 'node-pod',
      logs: [],
      events: [],
      fixHint: 'Fix command arguments in the container specification.',
    },
    successMessage: 'Fixed!',
    explanation: 'Container crashed.',
    validator: () => ({ isFixed: true }),
  };

  beforeEach(() => {
    useAppStore.setState({
      activeScenario: null,
      scenarioState: 'idle',
      scenarioFeedback: null,
    });
  });

  it('renders nothing when no scenario is active or failed', () => {
    const { container } = render(<FailureOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders failure overlay with error type and toggles hint', () => {
    useAppStore.setState({
      activeScenario: mockScenario,
      scenarioState: 'failed',
    });

    render(<FailureOverlay />);
    expect(screen.getByText('CrashLoopBackOff')).toBeInTheDocument();
    expect(screen.getByText('CrashLoopBackOff on Startup')).toBeInTheDocument();

    const hintBtn = screen.getByRole('button', { name: /show fix hint/i });
    fireEvent.click(hintBtn);

    expect(screen.getByTestId('failure-hint')).toHaveTextContent(
      'Fix command arguments in the container specification.',
    );
  });
});
