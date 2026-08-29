import { describe, it, expect, vi } from 'vitest';
import {
  encodeStateToHash,
  decodeStateFromHash,
  generateMermaidSequenceDiagram,
  generateMermaidGraphDiagram,
  generateDiagramExportJSON,
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

  it('generates diagram export JSON with metadata and steps', () => {
    const jsonStr = generateDiagramExportJSON('apiVersion: v1', 2, [], [], []);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.app).toBe('PodTrace');
    expect(parsed.stepIndex).toBe(2);
    expect(parsed.manifest).toBe('apiVersion: v1');
    expect(Array.isArray(parsed.steps)).toBe(true);
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

  it('generates mermaid sequence diagram when steps lack source/target node IDs', () => {
    const steps: LifecycleStep[] = [
      {
        stepNumber: 1,
        title: 'Internal cluster step',
        componentName: 'apiserver',
        componentRole: 'API',
        what: 'Internal compute',
        why: 'Validation',
      },
    ];

    const sequence = generateMermaidSequenceDiagram(steps);
    expect(sequence).toContain('Client->>Cluster: Internal cluster step');
  });

  it('generates mermaid graph architecture accurately', () => {
    const nodes: Node[] = [
      { id: 'node-apiserver', position: { x: 0, y: 0 }, data: { label: 'kube-apiserver' } },
      { id: 'node-etcd', position: { x: 0, y: 0 }, data: { label: 'etcd' } },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'node-apiserver', target: 'node-etcd', data: { label: 'gRPC 2379' } },
      { id: 'e2', source: 'node-etcd', target: 'node-apiserver' },
    ];

    const graph = generateMermaidGraphDiagram(nodes, edges);
    expect(graph).toContain('graph TD');
    expect(graph).toContain('node_apiserver["kube-apiserver"]');
    expect(graph).toContain('node_apiserver -->|"gRPC 2379"| node_etcd');
    expect(graph).toContain('node_etcd --> node_apiserver');
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

  it('filters out zone nodes and zone boundary edges from mermaid graph', () => {
    const nodes: Node[] = [
      { id: 'node-apiserver', position: { x: 0, y: 0 }, data: { label: 'kube-apiserver' } },
      { id: 'zone-controlplane', type: 'controlPlaneZone', position: { x: 0, y: 0 }, data: { label: 'Control Plane' } },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'zone-controlplane', target: 'node-apiserver', data: { label: 'boundary' } },
    ];

    const graph = generateMermaidGraphDiagram(nodes, edges);
    expect(graph).not.toContain('zone_controlplane');
    expect(graph).not.toContain('boundary');
    expect(graph).toContain('node_apiserver["kube-apiserver"]');
  });
});
