import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentInspector } from './ComponentInspector.tsx';
import { useAppStore } from '../../store/index.ts';

describe('ComponentInspector', () => {
  beforeEach(() => {
    useAppStore.setState({
      selectedNodeId: null,
      nodes: [
        {
          id: 'node-apiserver',
          type: 'apiServerNode',
          position: { x: 0, y: 0 },
          data: { label: 'kube-apiserver' },
        },
      ],
    });
  });

  it('renders nothing when no node is selected', () => {
    const { container } = render(<ComponentInspector />);
    expect(container.firstChild).toBeNull();
  });

  it('renders deep-dive information when node is selected', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    expect(screen.getByTestId('component-inspector')).toBeInTheDocument();
    expect(screen.getAllByText('kube-apiserver').length).toBeGreaterThan(0);
    expect(screen.getByText(/central control plane rest gateway/i)).toBeInTheDocument();
    expect(screen.getByText(/key responsibilities/i)).toBeInTheDocument();
  });

  it('switches between Overview, Flags, Metrics, and Debug tabs', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);

    // Flags tab
    const flagsTab = screen.getByRole('button', { name: /flags/i });
    fireEvent.click(flagsTab);
    expect(screen.getByText('--etcd-servers')).toBeInTheDocument();

    // Metrics tab
    const metricsTab = screen.getByRole('button', { name: /metrics/i });
    fireEvent.click(metricsTab);
    expect(screen.getByText('apiserver_request_total')).toBeInTheDocument();

    // Debug tab
    const debugTab = screen.getByRole('button', { name: /debug/i });
    fireEvent.click(debugTab);
    expect(screen.getByText(/common failure modes/i)).toBeInTheDocument();
    expect(screen.getByText('kubectl get --raw /healthz')).toBeInTheDocument();
  });

  it('closes inspector when close button is clicked', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    const closeBtn = screen.getByRole('button', { name: /close inspector/i });
    fireEvent.click(closeBtn);

    expect(useAppStore.getState().selectedNodeId).toBeNull();
  });

  it('renders fallback inspection metadata for custom or unmapped nodes', () => {
    useAppStore.setState({
      selectedNodeId: 'node-custom-foo',
      nodes: [
        {
          id: 'node-custom-foo',
          type: 'customResourceNode',
          position: { x: 0, y: 0 },
          data: { label: 'my-custom-operator' },
        },
      ],
    });

    render(<ComponentInspector />);
    expect(screen.getByTestId('component-inspector')).toBeInTheDocument();
    expect(screen.getByText('my-custom-operator')).toBeInTheDocument();
    expect(screen.getByText(/Cluster Architecture Component/i)).toBeInTheDocument();
  });
});
