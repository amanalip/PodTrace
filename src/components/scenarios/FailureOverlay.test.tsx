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
    expect(screen.getByRole('region', { name: /scenario failure details/i })).toBeInTheDocument();
    expect(screen.getByText('CrashLoopBackOff')).toBeInTheDocument();
    expect(screen.getByText('CrashLoopBackOff on Startup')).toBeInTheDocument();

    const hintBtn = screen.getByTestId('toggle-hint-btn');
    expect(hintBtn).toHaveAttribute('aria-expanded', 'false');
    expect(hintBtn).toHaveAttribute('aria-controls', 'failure-hint-box');
    fireEvent.click(hintBtn);

    expect(hintBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('failure-hint')).toHaveTextContent(
      'Fix command arguments in the container specification.',
    );
  });

  it('renders resolution state and allows completing and dismissing challenge', () => {
    useAppStore.setState({
      activeScenario: mockScenario,
      activeScenarioId: mockScenario.id,
      scenarioState: 'resolved',
    });

    render(<FailureOverlay />);
    expect(screen.getByTestId('scenario-success-overlay')).toBeInTheDocument();

    const completeBtn = screen.getByTestId('complete-scenario-btn');
    fireEvent.click(completeBtn);

    expect(useAppStore.getState().scenarioState).toBe('completed');
    expect(screen.getByTestId('dismiss-success-overlay-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dismiss-success-overlay-btn'));
    expect(useAppStore.getState().scenarioState).toBe('idle');
  });

  it('allows dismissing completed banner with x button', () => {
    useAppStore.setState({
      activeScenario: mockScenario,
      activeScenarioId: mockScenario.id,
      scenarioState: 'completed',
    });

    render(<FailureOverlay />);
    const xBtn = screen.getByTestId('dismiss-overlay-x');
    fireEvent.click(xBtn);
    expect(useAppStore.getState().scenarioState).toBe('idle');
  });

  it('displays custom feedback when scenarioState is fixing', () => {
    useAppStore.setState({
      activeScenario: mockScenario,
      activeScenarioId: mockScenario.id,
      scenarioState: 'fixing',
      scenarioFeedback: 'Please check container port assignment.',
    });

    render(<FailureOverlay />);
    expect(screen.getByText('Please check container port assignment.')).toBeInTheDocument();
  });
});
