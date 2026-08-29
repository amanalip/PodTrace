import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveRegion } from './LiveRegion.tsx';
import { useAppStore } from '../../store/index.ts';

describe('LiveRegion', () => {
  beforeEach(() => {
    useAppStore.setState({
      steps: [
        {
          stepNumber: 1,
          title: 'Apply Pod Manifest',
          componentName: 'kubectl',
          componentRole: 'CLI',
          what: 'kubectl sends HTTP POST to kube-apiserver',
          why: 'Initiates resource creation',
        },
      ],
      currentStepIndex: 0,
      scenarioState: 'idle',
      activeScenario: null,
    });
  });

  it('announces current step details to screen readers with polite atomic live region', () => {
    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toHaveTextContent(/step 1 of 1: apply pod manifest/i);
    expect(region).toHaveTextContent(/kubectl sends http post/i);
  });

  it('announces scenario failure when scenario fails', () => {
    useAppStore.setState({
      scenarioState: 'failed',
      activeScenario: {
        id: 'crashloopbackoff',
        title: 'CrashLoopBackOff on Startup',
        category: 'pod-lifecycle',
        difficulty: 'Beginner',
        description: 'Test',
        yamlTemplate: '...',
        failureStep: 9,
        failureDetails: {
          errorType: 'CrashLoopBackOff',
          failingStep: 9,
          failingNodeId: 'node-pod',
          logs: [],
          events: [],
          fixHint: 'Fix',
        },
        successMessage: 'Success',
        explanation: 'Exp',
        validator: () => ({ isFixed: false }),
      },
    });

    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveTextContent(/scenario failed: crashloopbackoff on startup/i);
    expect(region).toHaveTextContent(/error: crashloopbackoff/i);
  });

  it('announces scenario resolution when resolved', () => {
    useAppStore.setState({
      scenarioState: 'completed',
    });

    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveTextContent(/scenario resolved successfully!/i);
  });

  it('announces scenario feedback during fixing attempt', () => {
    useAppStore.setState({
      scenarioState: 'fixing',
      scenarioFeedback: 'Command still contains exit 1 error.',
    });

    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveTextContent(/command still contains exit 1 error/i);
  });

  it('announces default fix attempt message when scenarioFeedback is null in fixing state', () => {
    useAppStore.setState({
      scenarioState: 'fixing',
      scenarioFeedback: null,
    });

    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveTextContent(/fix attempt evaluated/i);
  });

  it('announces scenario success message when scenario is in resolved state', () => {
    useAppStore.setState({
      scenarioState: 'resolved',
      activeScenario: {
        id: 'crashloopbackoff',
        title: 'CrashLoopBackOff on Startup',
        category: 'pod-lifecycle',
        difficulty: 'Beginner',
        description: 'Test',
        yamlTemplate: '...',
        failureStep: 9,
        failureDetails: {
          errorType: 'CrashLoopBackOff',
          failingStep: 9,
          failingNodeId: 'node-pod',
          logs: [],
          events: [],
          fixHint: 'Fix',
        },
        successMessage: 'Great job, container starts without errors!',
        explanation: 'Exp',
        validator: () => ({ isFixed: true }),
      },
      scenarioFeedback: null,
    });

    render(<LiveRegion />);
    const region = screen.getByTestId('aria-live-region');
    expect(region).toHaveTextContent(/Great job, container starts without errors!/i);
  });
});
