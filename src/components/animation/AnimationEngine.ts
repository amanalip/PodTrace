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

  const nodeUpdates: Record<string, NodeStatus> = { ...(step.nodeStatusUpdates || {}) };
  const edgeUpdates: Record<string, EdgeStatus> = { ...(step.edgeStatusUpdates || {}) };

  // Fallback to active state for source/target nodes and edge when explicit map is omitted
  if (Object.keys(nodeUpdates).length === 0) {
    if (step.sourceNodeId) nodeUpdates[step.sourceNodeId] = 'active';
    if (step.targetNodeId) nodeUpdates[step.targetNodeId] = 'active';
  }

  if (Object.keys(edgeUpdates).length === 0 && step.edgeId) {
    edgeUpdates[step.edgeId] = 'active';
  }

  const updatedNodes = nodes.map((node) => {
    const newStatus = nodeUpdates[node.id] || ('idle' as NodeStatus);
    return {
      ...node,
      data: {
        ...(node.data as unknown as DiagramNodeData),
        status: newStatus,
      },
    };
  });

  const updatedEdges = edges.map((edge) => {
    const newStatus = edgeUpdates[edge.id] || ('inactive' as EdgeStatus);
    return {
      ...edge,
      data: {
        ...(edge.data as unknown as FlowEdgeData),
        status: newStatus,
      },
    };
  });

  return { nodes: updatedNodes, edges: updatedEdges };
}
