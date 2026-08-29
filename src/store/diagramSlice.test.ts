import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';

describe('diagramSlice in useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  });

  it('updates nodes list directly', () => {
    const store = useAppStore.getState();
    store.setNodes([{ id: 'test-node-1', position: { x: 10, y: 20 }, data: {} }]);

    const updated = useAppStore.getState();
    expect(updated.nodes).toHaveLength(1);
    expect(updated.nodes[0].id).toBe('test-node-1');
  });

  it('updates nodes via updater function', () => {
    const store = useAppStore.getState();
    store.setNodes([{ id: 'test-node-1', position: { x: 0, y: 0 }, data: {} }]);
    store.setNodes((prev) => [...prev, { id: 'test-node-2', position: { x: 50, y: 50 }, data: {} }]);

    const updated = useAppStore.getState();
    expect(updated.nodes).toHaveLength(2);
  });

  it('sets and clears selectedNodeId', () => {
    const store = useAppStore.getState();
    store.setSelectedNodeId('node-apiserver');
    expect(useAppStore.getState().selectedNodeId).toBe('node-apiserver');

    store.setSelectedNodeId(null);
    expect(useAppStore.getState().selectedNodeId).toBeNull();
  });

  it('resets diagram state by clearing nodes, edges, and selection', () => {
    const store = useAppStore.getState();
    store.setNodes([{ id: 'custom-node', position: { x: 0, y: 0 }, data: {} }]);
    store.setEdges([{ id: 'custom-edge', source: 'a', target: 'b' }]);
    store.setSelectedNodeId('custom-node');
    store.resetDiagram();

    const updated = useAppStore.getState();
    expect(updated.nodes).toHaveLength(0);
    expect(updated.edges).toHaveLength(0);
    expect(updated.selectedNodeId).toBeNull();
  });
});
