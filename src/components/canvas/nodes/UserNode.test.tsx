import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeProps, ReactFlowProvider } from '@xyflow/react';
import { UserNode, KubectlNode } from './UserNode.tsx';

const createMockNodeProps = (label?: string, subLabel?: string, status?: string): NodeProps =>
  ({
    id: 'mock-user-node',
    type: 'userNode',
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

describe('UserNode & KubectlNode', () => {
  it('renders UserNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <UserNode {...createMockNodeProps('Developer', 'Workstation', 'idle')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'Developer component, status: idle' })).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Workstation')).toBeInTheDocument();
  });

  it('renders KubectlNode with accessible role and labels', () => {
    render(
      <ReactFlowProvider>
        <KubectlNode {...createMockNodeProps('kubectl', 'CLI client', 'active')} />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('group', { name: 'kubectl component, status: active' })).toBeInTheDocument();
    expect(screen.getByText('kubectl')).toBeInTheDocument();
    expect(screen.getByText('CLI client')).toBeInTheDocument();
  });
});
