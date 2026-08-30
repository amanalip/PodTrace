import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  APIServerNode,
  ETCDNode,
  SchedulerNode,
  ControllerManagerNode,
} from './ControlPlaneNodes.tsx';
import {
  KubeletNode,
  KubeProxyNode,
  ContainerRuntimeNode,
  PodNode,
} from './WorkerNodes.tsx';

const createNodeProps = (data: Record<string, unknown>) =>
  ({
    id: 'test-node',
    data,
    type: 'custom',
    selected: false,
    zIndex: 1,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
  }) as unknown as Parameters<typeof APIServerNode>[0];

describe('ControlPlaneNodes', () => {
  it('renders APIServerNode with defaults and custom data', () => {
    const { rerender } = render(
      <ReactFlowProvider>
        <APIServerNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('API Server')).toBeInTheDocument();
    expect(screen.getByText('kube-apiserver')).toBeInTheDocument();

    rerender(
      <ReactFlowProvider>
        <APIServerNode {...createNodeProps({ label: 'Custom Gateway', subLabel: 'Port 6443' })} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('Custom Gateway')).toBeInTheDocument();
    expect(screen.getByText('Port 6443')).toBeInTheDocument();
  });

  it('renders ETCDNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <ETCDNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('etcd')).toBeInTheDocument();
    expect(screen.getByText('Cluster store')).toBeInTheDocument();
  });

  it('renders SchedulerNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <SchedulerNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('kube-scheduler')).toBeInTheDocument();
  });

  it('renders ControllerManagerNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <ControllerManagerNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('Controller Mgr')).toBeInTheDocument();
    expect(screen.getByText('kube-controller-manager')).toBeInTheDocument();
  });
});

describe('WorkerNodes', () => {
  it('renders KubeletNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <KubeletNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('Kubelet')).toBeInTheDocument();
    expect(screen.getByText('Node agent')).toBeInTheDocument();
  });

  it('renders KubeProxyNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <KubeProxyNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('kube-proxy')).toBeInTheDocument();
    expect(screen.getByText('Network rules')).toBeInTheDocument();
  });

  it('renders ContainerRuntimeNode with defaults', () => {
    render(
      <ReactFlowProvider>
        <ContainerRuntimeNode {...createNodeProps({})} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('Container Runtime')).toBeInTheDocument();
    expect(screen.getByText('CRI (containerd/CRI-O)')).toBeInTheDocument();
  });

  it('renders PodNode with container badges when containers are defined', () => {
    render(
      <ReactFlowProvider>
        <PodNode
          {...createNodeProps({
            label: 'auth-service',
            subLabel: 'Running',
            details: {
              containers: [
                { name: 'app-container', image: 'app:1.0' },
                { name: 'log-sidecar', image: 'fluentd:latest' },
              ],
            },
          })}
        />
      </ReactFlowProvider>,
    );
    expect(screen.getByText('auth-service')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('app-container')).toBeInTheDocument();
    expect(screen.getByText('log-sidecar')).toBeInTheDocument();
  });
});
