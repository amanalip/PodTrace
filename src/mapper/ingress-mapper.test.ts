import { describe, it, expect } from 'vitest';
import { mapIngressResource } from './ingress-mapper.ts';
import { IngressResource } from '../parser/resource-types.ts';

describe('ingress-mapper', () => {
  const sampleIngress: IngressResource = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: 'web-ingress',
      namespace: 'production',
    },
    spec: {
      ingressClassName: 'nginx',
      rules: [
        {
          host: 'api.example.com',
          http: {
            paths: [
              {
                path: '/v1',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: 'api-service',
                    port: { number: 80 },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  it('generates Ingress Controller, routing nodes, and proxy edges', () => {
    const { nodes, edges } = mapIngressResource(sampleIngress);

    // Ingress Controller and External Client
    expect(nodes.some((n) => n.id === 'node-external-client')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-ingress-controller')).toBe(true);

    // Ingress, Service, and Backend Pod
    expect(nodes.some((n) => n.id === 'node-ingress-web-ingress')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-service-api-service')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-api-service-backend')).toBe(true);

    // Edges
    expect(edges.some((e) => e.id === 'edge-client-ic-request')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-ic-proxy-pod')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-ic-client-response')).toBe(true);
  });
});
