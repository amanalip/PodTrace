import { describe, it, expect } from 'vitest';
import { mapCompositeResources } from './composite-mapper.ts';
import { K8sResource } from '../model/types.ts';

describe('composite-mapper', () => {
  const multiManifest: K8sResource[] = [
    {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: 'web-config', namespace: 'default' },
      data: { 'APP_ENV': 'production' },
    },
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'web-app', namespace: 'default' },
      spec: { replicas: 2 },
    },
    {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'web-service', namespace: 'default' },
      spec: { type: 'ClusterIP' },
    },
    {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: { name: 'web-ingress', namespace: 'default' },
    },
  ];

  it('generates composite nodes for all multi-document resources', () => {
    const { nodes, edges } = mapCompositeResources(multiManifest);

    expect(nodes.some((n) => n.id === 'node-config-web-config')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-service-web-service')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-ingress-web-ingress')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-app-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-app-2')).toBe(true);

    // Cross-resource linking edges
    expect(edges.some((e) => e.id === 'edge-ingress-service')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-service-pods')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-config-pod-mount')).toBe(true);
  });
});
