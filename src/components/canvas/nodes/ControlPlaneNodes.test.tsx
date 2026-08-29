import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeProps, ReactFlowProvider } from '@xyflow/react';
import {
  APIServerNode,
  ETCDNode,
  SchedulerNode,
  ControllerManagerNode,
} from './ControlPlaneNodes.tsx';

const createMockNodeProps = (label?: string, subLabel?: string, status?: string): NodeProps =>
  ({
    id: 'mock-node',
    type: 'controlPlane',
    selected: false,
    selectable: false,
    deletable: false,
    draggable: false,
    dragging: false,
    zIndex: 0,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { label, subLabel, status },
  }) as NodeProps;

describe('ControlPlaneNodes', () => {
  it('renders APIServerNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <APIServerNode {...createMockNodeProps('API Server', 'kube-apiserver', 'active')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'API Server component, status: active' })).toBeInTheDocument();
    expect(screen.getByText('API Server')).toBeInTheDocument();
    expect(screen.getByText('kube-apiserver')).toBeInTheDocument();
  });

  it('renders ETCDNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <ETCDNode {...createMockNodeProps('etcd', 'Cluster store', 'success')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'etcd component, status: success' })).toBeInTheDocument();
    expect(screen.getByText('etcd')).toBeInTheDocument();
    expect(screen.getByText('Cluster store')).toBeInTheDocument();
  });

  it('renders SchedulerNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <SchedulerNode {...createMockNodeProps('Scheduler', 'kube-scheduler', 'idle')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'Scheduler component, status: idle' })).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('kube-scheduler')).toBeInTheDocument();
  });

  it('renders ControllerManagerNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <ControllerManagerNode {...createMockNodeProps('Controller Mgr', 'kube-controller-manager', 'error')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'Controller Mgr component, status: error' })).toBeInTheDocument();
    expect(screen.getByText('Controller Mgr')).toBeInTheDocument();
    expect(screen.getByText('kube-controller-manager')).toBeInTheDocument();
  });
});
