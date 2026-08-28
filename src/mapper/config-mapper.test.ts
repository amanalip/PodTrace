import { describe, it, expect } from 'vitest';
import { mapConfigResource } from './config-mapper.ts';
import { ConfigMapResource, SecretResource, PersistentVolumeClaimResource } from '../parser/resource-types.ts';

describe('config-mapper', () => {
  it('maps ConfigMap resource with volume node and consumer pod', () => {
    const cm: ConfigMapResource = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: 'app-settings', namespace: 'default' },
      data: { 'app.json': '{"theme":"dark"}' },
    };

    const { nodes, edges } = mapConfigResource(cm);
    expect(nodes.some((n) => n.id === 'node-config-app-settings')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-volume-app-settings')).toBe(true);
    expect(nodes.some((n) => n.id === 'node-pod-consumer')).toBe(true);
    expect(edges.some((e) => e.id === 'edge-volume-pod-mount')).toBe(true);
  });

  it('maps Secret resource with in-memory tmpfs mount details', () => {
    const secret: SecretResource = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name: 'db-credentials', namespace: 'default' },
      type: 'Opaque',
      data: { password: 'c2VjcmV0' },
    };

    const { nodes } = mapConfigResource(secret);
    const volNode = nodes.find((n) => n.id === 'node-volume-db-credentials');
    expect(volNode?.data.subtitle).toContain('tmpfs');
  });

  it('maps PersistentVolumeClaim resource with CSI volume subtitle', () => {
    const pvc: PersistentVolumeClaimResource = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: 'data-pvc', namespace: 'default' },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '20Gi' } },
      },
    };

    const { nodes } = mapConfigResource(pvc);
    const configNode = nodes.find((n) => n.id === 'node-config-data-pvc');
    expect(configNode?.data.subtitle).toContain('20Gi');
  });
});
