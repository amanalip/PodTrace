import { describe, it, expect } from 'vitest';
import { STATIC_INITIAL_NODES, STATIC_INITIAL_EDGES } from './initial-elements.ts';

describe('initial-elements', () => {
  it('contains valid static initial nodes with unique IDs and default idle status', () => {
    expect(STATIC_INITIAL_NODES.length).toBeGreaterThan(0);

    const nodeIds = STATIC_INITIAL_NODES.map((n) => n.id);
    const uniqueIds = new Set(nodeIds);
    expect(uniqueIds.size).toBe(nodeIds.length);

    STATIC_INITIAL_NODES.forEach((node) => {
      expect(node.id).toBeTruthy();
      expect(node.position).toBeDefined();
      if (!node.type?.includes('Zone')) {
        expect(node.data?.status).toBe('idle');
      }
    });
  });

  it('contains valid static initial edges connecting known node IDs', () => {
    expect(STATIC_INITIAL_EDGES.length).toBeGreaterThan(0);

    const edgeIds = STATIC_INITIAL_EDGES.map((e) => e.id);
    const uniqueEdgeIds = new Set(edgeIds);
    expect(uniqueEdgeIds.size).toBe(edgeIds.length);

    const validNodeIds = new Set(STATIC_INITIAL_NODES.map((n) => n.id));
    STATIC_INITIAL_EDGES.forEach((edge) => {
      expect(validNodeIds.has(edge.source)).toBe(true);
      expect(validNodeIds.has(edge.target)).toBe(true);
      expect(edge.type).toBe('flowEdge');
      expect(edge.data?.status).toBe('inactive');
    });
  });

  it('verifies essential control plane nodes exist in initial elements', () => {
    const nodeIds = new Set(STATIC_INITIAL_NODES.map((n) => n.id));
    expect(nodeIds.has('node-apiserver')).toBe(true);
    expect(nodeIds.has('node-etcd')).toBe(true);
    expect(nodeIds.has('node-scheduler')).toBe(true);
  });

  it('verifies essential worker node components exist in initial elements', () => {
    const nodeIds = new Set(STATIC_INITIAL_NODES.map((n) => n.id));
    expect(nodeIds.has('node-kubelet')).toBe(true);
    expect(nodeIds.has('node-containerruntime')).toBe(true);
    expect(nodeIds.has('node-pod')).toBe(true);
  });

  it('verifies non-draggable and non-selectable attributes on architectural zones', () => {
    const zones = STATIC_INITIAL_NODES.filter((n) => n.type?.includes('Zone'));
    expect(zones.length).toBeGreaterThanOrEqual(4);

    zones.forEach((zone) => {
      expect(zone.draggable).toBe(false);
      expect(zone.selectable).toBe(false);
    });
  });
});
