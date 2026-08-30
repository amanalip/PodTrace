import { describe, it, expect } from 'vitest';
import { mapCompositeResources } from './composite-mapper.ts';
import { K8sResource } from '../model/types.ts';

describe('composite-mapper', () => {
  const multiManifest: K8sResource[] = [
    {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: 'web-config', namespace: 'custom-ns' },
      data: { 'APP_ENV': 'production' },
    },
    {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name: 'web-secret', namespace: 'custom-ns' },
      data: { 'DB_PASS': 'c2VjcmV0' },
    },
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'web-app', namespace: 'custom-ns' },
      spec: { replicas: 2 },
    },
    {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'web-service', namespace: 'custom-ns' },
      spec: { type: 'ClusterIP' },
    },
    {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: { name: 'web-ingress', namespace: 'custom-ns' },
    },
  ];

  it('generates composite nodes for all multi-document resources', () => {
    const { nodes, edges } = mapCompositeResources(multiManifest);

    expect(nodes.some((n) => n.id === 'node-config-web-config')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-secret-web-secret')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-service-web-service')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-ingress-web-ingress')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-app-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-web-app-2')).toBe(true);

    // Cross-resource linking edges
    expect(edges.some((e) => e.id === 'edge-ingress-service')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-service-pods')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-config-pod-mount')).toBe(true);
  });

  it('handles empty resource array with fallback defaults', () => {
    const { nodes, edges } = mapCompositeResources([]);
    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
    expect(nodes.some((n) => n.id === 'node-apiserver')).toBe(true);
  });

  it('distributes 2 worker pods across worker nodes appropriately', () => {
    const deployWith2Replicas: K8sResource[] = [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'scale-app' },
        spec: { replicas: 2 },
      },
    ];

    const { nodes } = mapCompositeResources(deployWith2Replicas);
    expect(nodes.some((n) => n.id === 'node-pod-scale-app-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-scale-app-2')).toBe(true);
  });

  it('omits ingress node when no Ingress resource is defined', () => {
    const noIngressManifest: K8sResource[] = [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'backend' },
      },
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: 'backend-svc' },
      },
    ];

    const { nodes, edges } = mapCompositeResources(noIngressManifest);
    expect(nodes.some((n) => n.id === 'node-ingress-backend-ingress')).toBe(false);
    expect(edges.some((e) => e.id === 'edge-ingress-service')).toBe(false);
  });
});
