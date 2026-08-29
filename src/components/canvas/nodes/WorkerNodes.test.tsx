import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeProps, ReactFlowProvider } from '@xyflow/react';
import {
  KubeletNode,
  KubeProxyNode,
  ContainerRuntimeNode,
  PodNode,
} from './WorkerNodes.tsx';

const createMockNodeProps = (label?: string, subLabel?: string, status?: string, details?: Record<string, unknown>): NodeProps =>
  ({
    id: 'mock-worker-node',
    type: 'workerNode',
    selected: false,
    selectable: false,
    deletable: false,
    draggable: false,
    dragging: false,
    zIndex: 0,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { label, subLabel, status, details },
  }) as NodeProps;

describe('WorkerNodes', () => {
  it('renders KubeletNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <KubeletNode {...createMockNodeProps('Kubelet', 'Node agent', 'active')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'Kubelet component, status: active' })).toBeInTheDocument();
    expect(screen.getByText('Kubelet')).toBeInTheDocument();
    expect(screen.getByText('Node agent')).toBeInTheDocument();
  });

  it('renders KubeProxyNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <KubeProxyNode {...createMockNodeProps('kube-proxy', 'Network rules', 'success')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'kube-proxy component, status: success' })).toBeInTheDocument();
    expect(screen.getByText('kube-proxy')).toBeInTheDocument();
    expect(screen.getByText('Network rules')).toBeInTheDocument();
  });

  it('renders ContainerRuntimeNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <ContainerRuntimeNode {...createMockNodeProps('Container Runtime', 'CRI (containerd/CRI-O)', 'idle')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'Container Runtime component, status: idle' })).toBeInTheDocument();
    expect(screen.getByText('Container Runtime')).toBeInTheDocument();
    expect(screen.getByText('CRI (containerd/CRI-O)')).toBeInTheDocument();
  });

  it('renders PodNode with containers list badges', () => {
    render(
      <ReactFlowProvider>
        <PodNode
          {...createMockNodeProps('nginx-pod', 'Workload', 'active', {
            containers: [{ name: 'nginx-container' }, { name: 'sidecar-logger' }],
          })}
        />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'nginx-pod component, status: active' })).toBeInTheDocument();
    expect(screen.getByText('nginx-pod')).toBeInTheDocument();
    expect(screen.getByText('nginx-container')).toBeInTheDocument();
    expect(screen.getByText('sidecar-logger')).toBeInTheDocument();
  });
});
