import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepIndicator } from './StepIndicator.tsx';
import { useAppStore } from '../../store/index.ts';

describe('StepIndicator', () => {
  beforeEach(() => {
    useAppStore.setState({
      steps: [
        {
          stepNumber: 1,
          title: 'Client sends Pod Manifest',
          componentName: 'kubectl',
          componentRole: 'CLI client',
          sourceNodeId: 'node-kubectl',
          targetNodeId: 'node-apiserver',
          what: 'kubectl sends manifest',
          why: 'Validation',
        },
        {
          stepNumber: 2,
          title: 'API Server validates schema',
          componentName: 'kube-apiserver',
          componentRole: 'API Gateway',
          sourceNodeId: 'node-apiserver',
          targetNodeId: 'node-etcd',
          what: 'Validates YAML structure',
          why: 'Schema checking',
        },
        {
          stepNumber: 3,
          title: 'etcd persists resource state',
          componentName: 'etcd',
          componentRole: 'State Database',
          sourceNodeId: 'node-apiserver',
          targetNodeId: 'node-etcd',
          what: 'Writes key to etcd store',
          why: 'Persistence',
        },
      ],
      currentStepIndex: 0,
    });
  });

  it('renders nothing when steps list is empty', () => {
    useAppStore.setState({ steps: [] });
    const { container } = render(<StepIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders current step number and step title text', () => {
    render(<StepIndicator />);

    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Client sends Pod Manifest')).toBeInTheDocument();
  });

  it('renders step navigation pills with aria-current on active pill', () => {
    render(<StepIndicator />);

    const group = screen.getByRole('group', { name: 'Lifecycle step navigation' });
    expect(group).toBeInTheDocument();

    const pill0 = screen.getByTestId('step-pill-0');
    const pill1 = screen.getByTestId('step-pill-1');
    const pill2 = screen.getByTestId('step-pill-2');

    expect(pill0).toHaveAttribute('aria-current', 'step');
    expect(pill1).not.toHaveAttribute('aria-current');
    expect(pill2).not.toHaveAttribute('aria-current');
  });

  it('jumps to corresponding step index when clicking a step pill', () => {
    render(<StepIndicator />);

    const pill2 = screen.getByTestId('step-pill-2');
    fireEvent.click(pill2);

    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });

  it('navigates with ArrowRight and ArrowLeft keyboard keys', () => {
    useAppStore.setState({ currentStepIndex: 1 });
    render(<StepIndicator />);

    const pill1 = screen.getByTestId('step-pill-1');

    fireEvent.keyDown(pill1, { key: 'ArrowRight' });
    expect(useAppStore.getState().currentStepIndex).toBe(2);

    fireEvent.keyDown(pill1, { key: 'ArrowLeft' });
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('clamps navigation when ArrowLeft is pressed on the first step', () => {
    useAppStore.setState({ currentStepIndex: 0 });
    render(<StepIndicator />);

    const pill0 = screen.getByTestId('step-pill-0');
    fireEvent.keyDown(pill0, { key: 'ArrowLeft' });
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('clamps navigation when ArrowRight is pressed on the last step', () => {
    useAppStore.setState({ currentStepIndex: 2 });
    render(<StepIndicator />);

    const pill2 = screen.getByTestId('step-pill-2');
    fireEvent.keyDown(pill2, { key: 'ArrowRight' });
    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });
});
