import { describe, it, expect } from 'vitest';
import { mapPodResource } from './pod-mapper.ts';
import { PodResource } from '../parser/resource-types.ts';

describe('pod-mapper', () => {
  const samplePod: PodResource = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: 'auth-service',
      namespace: 'production',
      labels: { app: 'auth' },
    },
    spec: {
      containers: [
        {
          name: 'auth-app',
          image: 'auth:v2.1',
          ports: [{ containerPort: 8080 }],
        },
      ],
    },
  };

  it('generates zone nodes and component nodes', () => {
    const { nodes } = mapPodResource(samplePod);

    expect(nodes.some((n) => n.id === 'zone-workstation')).toBe(true);
    expect(nodes.some((n) => n.id === 'zone-cluster')).toBe(true);
    expect(nodes.some((n) => n.id === 'zone-control-plane')).toBe(true);
    expect(nodes.some((n) => n.id === 'zone-worker-node-1')).toBe(true);
    expect(nodes.some((n) => n.id === 'zone-namespace')).toBe(true);

    expect(nodes.some((n) => n.id === 'node-user')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-kubectl')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-apiserver')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-etcd')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-scheduler')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-kubelet')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-containerruntime')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-kubeproxy')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-auth-service')).toBe(true);
  });

  it('extracts container specifications into pod node data', () => {
    const { nodes } = mapPodResource(samplePod);
    const podNode = nodes.find((n) => n.id === 'node-pod-auth-service');
    expect(podNode).toBeDefined();
    expect(podNode?.data.label).toBe('auth-service');
    const details = podNode?.data.details as { containers: Array<{ name: string; image: string }> };
    expect(details.containers).toEqual([{ name: 'auth-app', image: 'auth:v2.1' }]);
  });

  it('generates the 9 sequential pod lifecycle edges', () => {
    const { edges } = mapPodResource(samplePod);
    expect(edges).toHaveLength(9);

    expect(edges.some((e) => e.id === 'edge-user-kubectl')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-kubectl-apiserver')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-apiserver-etcd')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-scheduler-apiserver-watch')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-scheduler-apiserver-bind')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-apiserver-kubelet')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-kubelet-runtime')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-runtime-pod')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-proxy-pod')).toBe(true);
  });
});
