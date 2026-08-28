import { Node, Edge } from '@xyflow/react';
import { LifecycleStep, NodeStatus, EdgeStatus, DiagramNodeData } from '../../model/types.ts';
import { FlowEdgeData } from '../canvas/edges/FlowEdge.tsx';

export function applyStepToDiagram(
  step: LifecycleStep | undefined,
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  if (!step) {
    // Reset all nodes and edges to idle/inactive
    const resetNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...(node.data as unknown as DiagramNodeData),
        status: 'idle' as NodeStatus,
      },
    }));

    const resetEdges = edges.map((edge) => ({
      ...edge,
      data: {
        ...(edge.data as unknown as FlowEdgeData),
        status: 'inactive' as EdgeStatus,
      },
    }));

    return { nodes: resetNodes, edges: resetEdges };
  }

  const nodeUpdates = step.nodeStatusUpdates || {};
  const edgeUpdates = step.edgeStatusUpdates || {};

  const updatedNodes = nodes.map((node) => {
    const newStatus = nodeUpdates[node.id];
    if (newStatus) {
      return {
        ...node,
        data: {
          ...(node.data as unknown as DiagramNodeData),
          status: newStatus,
        },
      };
    }
    return node;
  });

  const updatedEdges = edges.map((edge) => {
    const newStatus = edgeUpdates[edge.id];
    if (newStatus) {
      return {
        ...edge,
        data: {
          ...(edge.data as unknown as FlowEdgeData),
          status: newStatus,
        },
      };
    }
    return edge;
  });

  return { nodes: updatedNodes, edges: updatedEdges };
}
