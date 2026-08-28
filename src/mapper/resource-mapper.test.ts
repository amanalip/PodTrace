import { describe, it, expect } from 'vitest';
import { mapResourcesToDiagram } from './resource-mapper.ts';
import { K8sResource } from '../model/types.ts';

describe('resource-mapper', () => {
  it('maps Pod resource to diagram with custom nodes and edges', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'demo-pod' },
        spec: { containers: [{ name: 'demo', image: 'demo:latest' }] },
      },
    ];

    const result = mapResourcesToDiagram(resources);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBe(9);
    expect(result.nodes.some((n) => n.id === 'node-pod-demo-pod')).toBe(true);
  });

  it('falls back to static elements when resource list is empty', () => {
    const result = mapResourcesToDiagram([]);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBe(8);
  });
});
