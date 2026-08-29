import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowEdge } from './FlowEdge.tsx';
import { Position } from '@xyflow/react';

describe('FlowEdge', () => {
  it('renders FlowEdge with path and packet animation when active', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-1"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
            data={{
              label: 'HTTP POST /api/v1/pods',
              status: 'active',
            }}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#38bdf8' });

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('aria-hidden', 'true');
    expect(circle).toHaveAttribute('fill', '#38bdf8');
  });

  it('renders inactive edge with slate dashed stroke and no packet animation', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-2"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
            data={{
              label: 'Inactive Flow',
              status: 'inactive',
            }}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#475569', strokeDasharray: '5 5' });
    expect(container.querySelector('circle')).toBeNull();
  });

  it('renders error edge with red stroke and red packet animation', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-3"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
            data={{
              label: 'Failed Flow',
              status: 'error',
            }}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#ef4444' });

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('fill', '#ef4444');
  });
});
