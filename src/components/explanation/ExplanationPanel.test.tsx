import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplanationPanel } from './ExplanationPanel.tsx';
import { useAppStore } from '../../store/index.ts';
import { createPodLifecycleSteps } from '../../lifecycle/pod-lifecycle.ts';

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = function () {};

describe('ExplanationPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      steps: [],
      currentStepIndex: 0,
    });
  });

  it('renders empty state when no steps exist', () => {
    render(<ExplanationPanel />);
    expect(screen.getByTestId('explanation-panel-empty')).toBeInTheDocument();
    expect(screen.getByText('No active lifecycle steps.')).toBeInTheDocument();
  });

  it('renders all lifecycle steps with details', () => {
    const steps = createPodLifecycleSteps('web-pod');
    useAppStore.setState({
      steps,
      currentStepIndex: 2,
    });

    render(<ExplanationPanel />);

    expect(screen.getByTestId('explanation-panel')).toBeInTheDocument();
    expect(screen.getByTestId('step-detail-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-detail-3')).toBeInTheDocument();
    expect(screen.getByText('API Server stores Pod spec in etcd')).toBeInTheDocument();
    expect(screen.getByText('Step 3 (Active)')).toBeInTheDocument();
  });

  it('renders What Happens, Why It Matters, and docs links', () => {
    const steps = createPodLifecycleSteps('web-pod');
    useAppStore.setState({
      steps,
      currentStepIndex: 0,
    });

    render(<ExplanationPanel />);

    expect(screen.getAllByText('What Happens').length).toBe(9);
    expect(screen.getAllByText('Why It Matters').length).toBe(9);
    expect(screen.getByText('kubectl')).toBeInTheDocument();

    const docsLinks = screen.getAllByRole('link', { name: /docs/i });
    expect(docsLinks.length).toBeGreaterThan(0);
    expect(docsLinks[0]).toHaveAttribute('href', expect.stringContaining('kubernetes.io'));
  });

  it('jumps to step index when clicking a step card', () => {
    const steps = createPodLifecycleSteps('web-pod');
    useAppStore.setState({
      steps,
      currentStepIndex: 0,
    });

    render(<ExplanationPanel />);

    const step5Card = screen.getByTestId('step-detail-5');
    fireEvent.click(step5Card);

    expect(useAppStore.getState().currentStepIndex).toBe(4);
  });
});
