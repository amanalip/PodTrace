import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagramCanvas } from './DiagramCanvas.tsx';
import { useAppStore } from '../../store/index.ts';

// ResizeObserver mock for React Flow in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DiagramCanvas', () => {
  beforeEach(() => {
    useAppStore.getState().resetDiagram();
  });

  it('renders canvas container', () => {
    render(<DiagramCanvas />);
    expect(screen.getByTestId('diagram-canvas-container')).toBeInTheDocument();
  });

  it('renders default control plane and worker node components', () => {
    render(<DiagramCanvas />);

    expect(screen.getByText('API Server')).toBeInTheDocument();
    expect(screen.getByText('etcd')).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Kubelet')).toBeInTheDocument();
    expect(screen.getByText('Container Runtime')).toBeInTheDocument();
    expect(screen.getByText('nginx-pod')).toBeInTheDocument();
  });

  it('renders nested cluster and workstation zones', () => {
    render(<DiagramCanvas />);

    expect(screen.getByText('Local Workstation')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes Cluster')).toBeInTheDocument();
    expect(screen.getByText('Control Plane')).toBeInTheDocument();
    expect(screen.getByText('Worker Node 1')).toBeInTheDocument();
  });
});
