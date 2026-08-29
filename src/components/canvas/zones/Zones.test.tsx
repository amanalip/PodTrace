import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeProps } from '@xyflow/react';
import {
  WorkstationZone,
  ClusterZone,
  ControlPlaneZone,
  WorkerNodeZone,
  NamespaceZone,
} from './Zones.tsx';

const createMockNodeProps = (label: string): NodeProps =>
  ({
    id: 'mock-id',
    type: 'zone',
    selected: false,
    selectable: false,
    deletable: false,
    draggable: false,
    dragging: false,
    zIndex: 0,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { label },
  }) as NodeProps;

describe('Zones', () => {
  it('renders WorkstationZone with accessible group role and boundary label', () => {
    render(<WorkstationZone {...createMockNodeProps('Local Workstation')} />);

    expect(screen.getByRole('group', { name: 'Boundary: Local Workstation' })).toBeInTheDocument();
    expect(screen.getByText('Local Workstation')).toBeInTheDocument();
  });

  it('renders ClusterZone with accessible group role and boundary label', () => {
    render(<ClusterZone {...createMockNodeProps('Kubernetes Cluster')} />);

    expect(screen.getByRole('group', { name: 'Boundary: Kubernetes Cluster' })).toBeInTheDocument();
    expect(screen.getByText('Kubernetes Cluster')).toBeInTheDocument();
  });

  it('renders ControlPlaneZone with accessible group role and boundary label', () => {
    render(<ControlPlaneZone {...createMockNodeProps('Control Plane')} />);

    expect(screen.getByRole('group', { name: 'Boundary: Control Plane' })).toBeInTheDocument();
    expect(screen.getByText('Control Plane')).toBeInTheDocument();
  });

  it('renders WorkerNodeZone with accessible group role and boundary label', () => {
    render(<WorkerNodeZone {...createMockNodeProps('Worker Node 1')} />);

    expect(screen.getByRole('group', { name: 'Boundary: Worker Node 1' })).toBeInTheDocument();
    expect(screen.getByText('Worker Node 1')).toBeInTheDocument();
  });

  it('renders NamespaceZone with accessible group role and boundary label', () => {
    render(<NamespaceZone {...createMockNodeProps('default namespace')} />);

    expect(screen.getByRole('group', { name: 'Boundary: default namespace' })).toBeInTheDocument();
    expect(screen.getByText('default namespace')).toBeInTheDocument();
  });
});
