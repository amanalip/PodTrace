import { describe, it, expect } from 'vitest';
import { mapDeploymentResource } from './deployment-mapper.ts';
import { DeploymentResource } from '../parser/resource-types.ts';

describe('deployment-mapper', () => {
  const sampleDeployment: DeploymentResource = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'web-deployment',
      namespace: 'production',
    },
    spec: {
      replicas: 3,
      selector: { matchLabels: { app: 'web' } },
      template: {
        metadata: { labels: { app: 'web' } },
        spec: {
          containers: [{ name: 'web-app', image: 'nginx:1.25' }],
        },
      },
    },
  };

  it('generates multi-node zones and distributed pod nodes', () => {
    const { nodes, edges } = mapDeploymentResource(sampleDeployment);

    // Multi-worker zones
    expect(nodes.some((n) => n.id === 'zone-worker-node-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'zone-worker-node-2')).toBe(true);

    // Control plane components
    expect(nodes.some((n) => n.id === 'node-controllermanager')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-scheduler')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-apiserver')).toBe(true);

    // Distributed Pod nodes (3 replicas)
    expect(nodes.some((n) => n.id === 'node-pod-web-deployment-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-deployment-2')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-deployment-3')).toBe(true);

    // Edges
    expect(edges.some((e) => e.id === 'edge-cm-create-rs')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-cm-create-pods')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-scheduler-apiserver')).toBe(true);
  });
});
