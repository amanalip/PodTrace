import { describe, it, expect } from 'vitest';
import { mapServiceResource } from './service-mapper.ts';
import { ServiceResource } from '../parser/resource-types.ts';

describe('service-mapper', () => {
  const sampleService: ServiceResource = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'auth-service',
      namespace: 'staging',
    },
    spec: {
      type: 'ClusterIP',
      clusterIP: '10.96.12.34',
      selector: { app: 'auth' },
      ports: [{ port: 80, targetPort: 8080, protocol: 'TCP' }],
    },
  };

  it('generates Service node, EndpointSlice node, and kube-proxy components', () => {
    const { nodes, edges } = mapServiceResource(sampleService);

    // Service and EndpointSlice
    expect(nodes.some((n) => n.id === 'node-service-auth-service')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-endpointslice-auth-service')).toBe(true);

    // CoreDNS and Controllers
    expect(nodes.some((n) => n.id === 'node-coredns')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-controllermanager')).toBe(true);

    // KubeProxy on worker nodes
    expect(nodes.some((n) => n.id === 'node-kubeproxy-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-kubeproxy-2')).toBe(true);

    // Backend pods
    expect(nodes.some((n) => n.id === 'node-pod-backend-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-backend-2')).toBe(true);

    // Edges
    expect(edges.some((e) => e.id === 'edge-cm-create-epslice')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-proxy-rules-1')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-coredns-watch')).toBe(true);
  });
});
