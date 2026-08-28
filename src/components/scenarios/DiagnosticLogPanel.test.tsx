import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagnosticLogPanel } from './DiagnosticLogPanel.tsx';
import { useAppStore } from '../../store/index.ts';
import { Scenario } from '../../scenarios/scenario-types.ts';

describe('DiagnosticLogPanel', () => {
  const mockScenario: Scenario = {
    id: 'sc-diag',
    title: 'ImagePullBackOff Scenario',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'Image missing',
    yamlTemplate: '...',
    failureStep: 8,
    failureDetails: {
      errorType: 'ErrImagePull',
      failingStep: 8,
      failingNodeId: 'node-kubelet',
      events: [
        {
          type: 'Warning',
          reason: 'Failed',
          message: 'Failed to pull image "nginx:invalid"',
          from: 'kubelet',
          age: '12s',
        },
      ],
      logs: [
        {
          timestamp: '2026-08-28T12:00:00Z',
          level: 'error',
          component: 'kubelet',
          message: 'rpc error: code = NotFound desc = failed to pull image',
        },
      ],
      fixHint: 'Fix the tag',
    },
    successMessage: 'Fixed',
    explanation: 'Image pull failed',
    validator: () => ({ isFixed: true }),
  };

  beforeEach(() => {
    useAppStore.setState({
      activeScenario: null,
      scenarioState: 'idle',
    });
  });

  it('renders placeholder when no scenario is loaded', () => {
    render(<DiagnosticLogPanel />);
    expect(screen.getByText(/no active scenario loaded/i)).toBeInTheDocument();
  });

  it('renders events and switches between logs and conditions tabs', () => {
    useAppStore.setState({
      activeScenario: mockScenario,
      scenarioState: 'failed',
    });

    render(<DiagnosticLogPanel />);

    // Default tab: Events
    expect(screen.getByText('Failed to pull image "nginx:invalid"')).toBeInTheDocument();

    // Switch to Logs tab
    const logsTabBtn = screen.getByRole('button', { name: /logs/i });
    fireEvent.click(logsTabBtn);
    expect(screen.getByText(/rpc error: code = NotFound/i)).toBeInTheDocument();

    // Switch to Conditions tab
    const conditionsTabBtn = screen.getByRole('button', { name: /conditions/i });
    fireEvent.click(conditionsTabBtn);
    expect(screen.getByText('PodScheduled')).toBeInTheDocument();
    expect(screen.getByText('ContainersReady')).toBeInTheDocument();
  });
});
