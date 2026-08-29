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

  it('renders complete edge with emerald green stroke and no packet animation', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-4"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
            data={{
              label: 'Success Flow',
              status: 'complete',
            }}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#22c55e' });
    expect(container.querySelector('circle')).toBeNull();
  });

  it('renders warning edge with amber stroke and amber packet animation', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-5"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
            data={{
              label: 'Warning Flow',
              status: 'warning',
            }}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#f59e0b' });

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('fill', '#f59e0b');
  });

  it('renders default fallback styling when data prop is omitted', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <FlowEdge
            id="edge-6"
            source="node-1"
            target="node-2"
            sourceX={0}
            sourceY={0}
            targetX={100}
            targetY={100}
            sourcePosition={Position.Right}
            targetPosition={Position.Left}
          />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveStyle({ stroke: '#475569' });
  });
});
