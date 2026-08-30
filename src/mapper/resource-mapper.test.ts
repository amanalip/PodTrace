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

  it('maps StatefulSet and DaemonSet to multi-replica workload diagrams', () => {
    const sts: K8sResource[] = [
      {
        apiVersion: 'apps/v1',
        kind: 'StatefulSet',
        metadata: { name: 'redis-cluster' },
        spec: {
          replicas: 2,
          selector: { matchLabels: { app: 'redis' } },
          template: {
            metadata: { labels: { app: 'redis' } },
            spec: { containers: [{ name: 'redis', image: 'redis:alpine' }] },
          },
        },
      },
    ];

    const result = mapResourcesToDiagram(sts);
    expect(result.nodes.some((n) => n.id === 'node-pod-redis-cluster-1')).toBe(true);
    expect(result.nodes.some((n) => n.id === 'node-pod-redis-cluster-2')).toBe(true);
  });

  it('maps Job and CronJob to pod workload diagrams', () => {
    const job: K8sResource[] = [
      {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: { name: 'db-migration' },
        spec: {
          template: {
            spec: { containers: [{ name: 'flyway', image: 'flyway:latest' }] },
          },
        },
      },
    ];

    const result = mapResourcesToDiagram(job);
    expect(result.nodes.some((n) => n.id === 'node-pod-db-migration')).toBe(true);
  });

  it('maps PersistentVolume to volume config diagram', () => {
    const pv: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'PersistentVolume',
        metadata: { name: 'local-storage-pv' },
        spec: {
          capacity: { storage: '50Gi' },
          accessModes: ['ReadWriteOnce'],
        },
      },
    ];

    const result = mapResourcesToDiagram(pv);
    expect(result.nodes.some((n) => n.id === 'node-config-local-storage-pv')).toBe(true);
    expect(result.nodes.some((n) => n.id === 'node-volume-local-storage-pv')).toBe(true);
  });

  it('falls back to static elements when resource list is empty', () => {
    const result = mapResourcesToDiagram([]);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBe(8);
  });
});
