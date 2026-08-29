import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepDetail } from './StepDetail.tsx';
import { LifecycleStep } from '../../model/types.ts';

const mockStep: LifecycleStep = {
  stepNumber: 1,
  title: 'Client sends Pod Manifest',
  sourceNodeId: 'node-kubectl',
  targetNodeId: 'node-apiserver',
  what: 'kubectl applies the YAML definition to the API Server via HTTP POST.',
  why: 'Declarative manifests must be submitted to the control plane for validation.',
  componentName: 'kubectl',
  componentRole: 'CLI Workstation Tool',
  docsUrl: 'https://kubernetes.io/docs/reference/kubectl/',
  durationMs: 1500,
};

describe('StepDetail', () => {
  it('renders step details with active status badge', () => {
    render(<StepDetail step={mockStep} status="current" />);

    expect(screen.getByText('Step 1 (Active)')).toBeInTheDocument();
    expect(screen.getByText(mockStep.title)).toBeInTheDocument();
    expect(screen.getByText(mockStep.what)).toBeInTheDocument();
    expect(screen.getByText(mockStep.why)).toBeInTheDocument();
    expect(screen.getByText(mockStep.componentName)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs/i })).toHaveAttribute('href', mockStep.docsUrl);
  });

  it('triggers onClick on mouse click and keyboard Enter/Space', () => {
    const onClick = vi.fn();
    render(<StepDetail step={mockStep} status="future" onClick={onClick} />);

    const card = screen.getByTestId('step-detail-1');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not trigger parent onClick when clicking docs link', () => {
    const onClick = vi.fn();
    render(<StepDetail step={mockStep} status="current" onClick={onClick} />);

    const docsLink = screen.getByRole('link', { name: /docs/i });
    fireEvent.click(docsLink);

    // Event propagation stopped, onClick should not be called
    expect(onClick).not.toHaveBeenCalled();
  });
});
