import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { BaseNode } from './BaseNode.tsx';
import { Server } from 'lucide-react';

describe('BaseNode', () => {
  it('renders label, sublabel, status and role=group ARIA semantics', () => {
    render(
      <ReactFlowProvider>
        <BaseNode
          label="kube-apiserver"
          subLabel="Control Plane"
          icon={<Server size={16} />}
          status="active"
          accentColor="#38bdf8"
        />
      </ReactFlowProvider>
    );

    const nodeGroup = screen.getByRole('group', {
      name: 'kube-apiserver component, status: active',
    });
    expect(nodeGroup).toBeInTheDocument();
    expect(screen.getByText('kube-apiserver')).toBeInTheDocument();
    expect(screen.getByText('Control Plane')).toBeInTheDocument();
    expect(screen.getByTestId('node-kube-apiserver')).toBeInTheDocument();
  });
});
