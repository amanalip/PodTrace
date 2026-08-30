import { describe, it, expect, beforeEach, vi } from 'vitest';
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
        {
          id: 'node-etcd',
          type: 'etcdNode',
          position: { x: 0, y: 0 },
          data: { label: 'etcd' },
        },
        {
          id: 'node-scheduler',
          type: 'schedulerNode',
          position: { x: 0, y: 0 },
          data: { label: 'kube-scheduler' },
        },
        {
          id: 'node-kubelet',
          type: 'kubeletNode',
          position: { x: 0, y: 0 },
          data: { label: 'kubelet' },
        },
      ],
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders nothing when no node is selected', () => {
    const { container } = render(<ComponentInspector />);
    expect(container.firstChild).toBeNull();
  });

  it('renders detailed information when node is selected', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    expect(screen.getByTestId('component-inspector')).toBeInTheDocument();
    expect(screen.getAllByText('kube-apiserver').length).toBeGreaterThan(0);
    expect(screen.getByText(/central control plane rest gateway/i)).toBeInTheDocument();
    expect(screen.getByText(/key responsibilities/i)).toBeInTheDocument();
  });

  it('switches between Overview, Flags, Metrics, and Debug tabs with ARIA tablist', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();

    // Flags tab
    const flagsTab = screen.getByRole('tab', { name: /flags/i });
    expect(flagsTab).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(flagsTab);
    expect(flagsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('--etcd-servers')).toBeInTheDocument();

    // Metrics tab
    const metricsTab = screen.getByRole('tab', { name: /metrics/i });
    fireEvent.click(metricsTab);
    expect(screen.getByText('apiserver_request_total')).toBeInTheDocument();

    // Debug tab
    const debugTab = screen.getByRole('tab', { name: /debug/i });
    fireEvent.click(debugTab);
    expect(screen.getByText(/common failure modes/i)).toBeInTheDocument();
    expect(screen.getByText('kubectl get --raw /healthz')).toBeInTheDocument();
  });

  it('copies debug command on button click in debug tab', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    const debugTab = screen.getByRole('tab', { name: /debug/i });
    fireEvent.click(debugTab);

    const copyBtn = screen.getByLabelText('Copy kubectl get --raw /healthz');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('kubectl get --raw /healthz');
  });

  it('closes inspector when close icon button is clicked', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    const closeBtn = screen.getByLabelText(/close inspector/i);
    fireEvent.click(closeBtn);

    expect(useAppStore.getState().selectedNodeId).toBeNull();
  });

  it('closes inspector when Escape key is pressed', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    fireEvent.keyDown(window, { key: 'Escape' });
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

  it('provides a valid official Kubernetes source link', () => {
    useAppStore.setState({ selectedNodeId: 'node-apiserver' });

    render(<ComponentInspector />);
    const sourceLink = screen.getByRole('link', { name: /source code on github/i });
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-apiserver');
    expect(sourceLink).toHaveAttribute('target', '_blank');
  });

  it('renders etcd inspector details when etcd node is selected', () => {
    useAppStore.setState({ selectedNodeId: 'node-etcd' });

    render(<ComponentInspector />);
    expect(screen.getByText(/Distributed Key-Value Store/i)).toBeInTheDocument();
    expect(screen.getByText(/Provides strongly consistent state storage/i)).toBeInTheDocument();
  });

  it('renders kube-scheduler inspector details when scheduler node is selected', () => {
    useAppStore.setState({ selectedNodeId: 'node-scheduler' });

    render(<ComponentInspector />);
    expect(screen.getByText(/Workload Placement Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Identifies unscheduled Pods/i)).toBeInTheDocument();
  });

  it('renders kubelet inspector details when kubelet node is selected', () => {
    useAppStore.setState({ selectedNodeId: 'node-kubelet' });

    render(<ComponentInspector />);
    expect(screen.getByText(/Primary Worker Node Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/Watches Pod specifications assigned/i)).toBeInTheDocument();
  });
});
