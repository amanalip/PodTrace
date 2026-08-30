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

  it('handles NodePort service type correctly', () => {
    const nodePortSvc: ServiceResource = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'nodeport-svc' },
      spec: { type: 'NodePort', ports: [{ port: 80, nodePort: 30080 }] },
    };

    const { nodes } = mapServiceResource(nodePortSvc);
    const svcNode = nodes.find((n) => n.id === 'node-service-nodeport-svc');
    expect(svcNode?.data?.subtitle).toContain('NodePort');
  });

  it('handles LoadBalancer service type correctly', () => {
    const lbSvc: ServiceResource = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'lb-svc' },
      spec: { type: 'LoadBalancer', ports: [{ port: 443 }] },
    };

    const { nodes } = mapServiceResource(lbSvc);
    const svcNode = nodes.find((n) => n.id === 'node-service-lb-svc');
    expect(svcNode?.data?.subtitle).toContain('LoadBalancer');
  });

  it('uses default clusterIP allocation when spec.clusterIP is omitted', () => {
    const defaultSvc: ServiceResource = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'default-svc' },
      spec: { ports: [{ port: 80 }] },
    };

    const { nodes } = mapServiceResource(defaultSvc);
    const svcNode = nodes.find((n) => n.id === 'node-service-default-svc');
    expect(svcNode?.data?.label).toBe('Service: default-svc');
  });
});
