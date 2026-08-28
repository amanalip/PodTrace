import { describe, it, expect, vi } from 'vitest';
import {
  encodeStateToHash,
  decodeStateFromHash,
  generateMermaidSequenceDiagram,
  generateMermaidGraphDiagram,
  downloadFile,
} from './export-utils.ts';
import { LifecycleStep } from '../model/types.ts';
import { Node, Edge } from '@xyflow/react';

describe('export-utils', () => {
  it('encodes and decodes state to and from URL hash', () => {
    const yaml = 'apiVersion: v1\nkind: Pod';
    const step = 3;
    const theme = 'dark';

    const hash = encodeStateToHash(yaml, step, theme);
    expect(hash.startsWith('#data=')).toBe(true);

    const decoded = decodeStateFromHash(hash);
    expect(decoded).toEqual({ yaml, step, theme });
  });

  it('handles invalid hash gracefully', () => {
    expect(decodeStateFromHash('')).toBeNull();
    expect(decodeStateFromHash('#invalid=123')).toBeNull();
    expect(decodeStateFromHash('#data=not-valid-base64-json!')).toBeNull();
  });

  it('generates mermaid sequence diagram accurately', () => {
    const steps: LifecycleStep[] = [
      {
        stepNumber: 1,
        title: 'Apply Pod',
        componentName: 'kubectl',
        componentRole: 'CLI',
        sourceNodeId: 'node-kubectl',
        targetNodeId: 'node-apiserver',
        edgeLabel: 'POST /api/v1/pods',
        what: 'Send request',
        why: 'Apply spec',
      },
    ];

    const sequence = generateMermaidSequenceDiagram(steps);
    expect(sequence).toContain('sequenceDiagram');
    expect(sequence).toContain('node_kubectl->>node_apiserver: POST /api/v1/pods');
  });

  it('generates mermaid graph architecture accurately', () => {
    const nodes: Node[] = [
      { id: 'node-apiserver', position: { x: 0, y: 0 }, data: { label: 'kube-apiserver' } },
      { id: 'node-etcd', position: { x: 0, y: 0 }, data: { label: 'etcd' } },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'node-apiserver', target: 'node-etcd', data: { label: 'gRPC 2379' } },
    ];

    const graph = generateMermaidGraphDiagram(nodes, edges);
    expect(graph).toContain('graph TD');
    expect(graph).toContain('node_apiserver["kube-apiserver"]');
    expect(graph).toContain('node_apiserver -->|"gRPC 2379"| node_etcd');
  });

  it('triggers browser file download with blob', () => {
    const createObjectURLMock = vi.fn(() => 'blob:url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    downloadFile('test-content', 'test.txt', 'text/plain');
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});
