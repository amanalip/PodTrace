import { describe, it, expect } from 'vitest';
import { applyStepToDiagram } from './AnimationEngine.ts';
import { LifecycleStep } from '../../model/types.ts';
import { Node, Edge } from '@xyflow/react';

describe('AnimationEngine', () => {
  const initialNodes: Node[] = [
    { id: 'node-user', position: { x: 0, y: 0 }, data: { label: 'User', status: 'idle' } },
    { id: 'node-kubectl', position: { x: 100, y: 0 }, data: { label: 'kubectl', status: 'idle' } },
  ];

  const initialEdges: Edge[] = [
    { id: 'edge-1', source: 'node-user', target: 'node-kubectl', data: { status: 'inactive' } },
  ];

  it('applies node and edge status updates from step', () => {
    const step: LifecycleStep = {
      stepNumber: 1,
      title: 'Test Step',
      what: 'What',
      why: 'Why',
      componentName: 'kubectl',
      componentRole: 'CLI',
      nodeStatusUpdates: {
        'node-user': 'success',
        'node-kubectl': 'active',
      },
      edgeStatusUpdates: {
        'edge-1': 'active',
      },
    };

    const { nodes, edges } = applyStepToDiagram(step, initialNodes, initialEdges);
    expect(nodes[0].data.status).toBe('success');
    expect(nodes[1].data.status).toBe('active');
    expect(edges[0].data?.status).toBe('active');
  });

  it('resets all nodes to idle and edges to inactive when step is undefined', () => {
    const activeNodes: Node[] = [
      { id: 'node-user', position: { x: 0, y: 0 }, data: { label: 'User', status: 'success' } },
      { id: 'node-kubectl', position: { x: 100, y: 0 }, data: { label: 'kubectl', status: 'active' } },
    ];

    const activeEdges: Edge[] = [
      { id: 'edge-1', source: 'node-user', target: 'node-kubectl', data: { status: 'active' } },
    ];

    const { nodes, edges } = applyStepToDiagram(undefined, activeNodes, activeEdges);
    expect(nodes[0].data.status).toBe('idle');
    expect(nodes[1].data.status).toBe('idle');
    expect(edges[0].data?.status).toBe('inactive');
  });

  it('resets unmentioned nodes to idle when jumping between distinct steps', () => {
    const priorNodes: Node[] = [
      { id: 'node-user', position: { x: 0, y: 0 }, data: { label: 'User', status: 'success' } },
      { id: 'node-kubectl', position: { x: 100, y: 0 }, data: { label: 'kubectl', status: 'active' } },
    ];
    const priorEdges: Edge[] = [
      { id: 'edge-1', source: 'node-user', target: 'node-kubectl', data: { status: 'active' } },
    ];

    const nextStep: LifecycleStep = {
      stepNumber: 2,
      title: 'Next Step',
      what: 'What',
      why: 'Why',
      componentName: 'apiserver',
      componentRole: 'Gateway',
      nodeStatusUpdates: {
        'node-user': 'success',
      },
      edgeStatusUpdates: {},
    };

    const { nodes, edges } = applyStepToDiagram(nextStep, priorNodes, priorEdges);
    expect(nodes[0].data.status).toBe('success');
    expect(nodes[1].data.status).toBe('idle');
    expect(edges[0].data?.status).toBe('inactive');
  });

  it('falls back to source, target, and edgeId activation when status maps are omitted', () => {
    const stepWithoutMaps: LifecycleStep = {
      stepNumber: 1,
      title: 'Fallback Step',
      what: 'What',
      why: 'Why',
      componentName: 'kubectl',
      componentRole: 'CLI',
      sourceNodeId: 'node-user',
      targetNodeId: 'node-kubectl',
      edgeId: 'edge-1',
    };

    const { nodes, edges } = applyStepToDiagram(stepWithoutMaps, initialNodes, initialEdges);
    expect(nodes[0].data.status).toBe('active');
    expect(nodes[1].data.status).toBe('active');
    expect(edges[0].data?.status).toBe('active');
  });
});
