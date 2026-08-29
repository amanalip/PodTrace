import { describe, it, expect } from 'vitest';
import { createZoneNodes, ZONE_LAYOUT_CONFIG } from './zone-layout.ts';

describe('zone-layout', () => {
  it('exposes defined configuration bounds for all zones', () => {
    expect(ZONE_LAYOUT_CONFIG.workstation.width).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.workstation.height).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.cluster.width).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.cluster.height).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.controlPlane.width).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.controlPlane.height).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.workerNode.width).toBeGreaterThan(0);
    expect(ZONE_LAYOUT_CONFIG.workerNode.height).toBeGreaterThan(0);
  });

  it('generates standard workstation, cluster, and control plane zones by default', () => {
    const nodes = createZoneNodes(1);

    const workstation = nodes.find((n) => n.id === 'zone-workstation');
    expect(workstation).toBeDefined();
    expect(workstation?.type).toBe('workstationZone');
    expect(workstation?.draggable).toBe(false);

    const cluster = nodes.find((n) => n.id === 'zone-cluster');
    expect(cluster).toBeDefined();
    expect(cluster?.type).toBe('clusterZone');

    const controlPlane = nodes.find((n) => n.id === 'zone-control-plane');
    expect(controlPlane).toBeDefined();
    expect(controlPlane?.parentId).toBe('zone-cluster');

    const worker1 = nodes.find((n) => n.id === 'zone-worker-node-1');
    expect(worker1).toBeDefined();
    expect(worker1?.parentId).toBe('zone-cluster');
  });

  it('scales cluster height and creates multiple worker node zones', () => {
    const nodes = createZoneNodes(3);

    const worker1 = nodes.find((n) => n.id === 'zone-worker-node-1');
    const worker2 = nodes.find((n) => n.id === 'zone-worker-node-2');
    const worker3 = nodes.find((n) => n.id === 'zone-worker-node-3');

    expect(worker1).toBeDefined();
    expect(worker2).toBeDefined();
    expect(worker3).toBeDefined();

    expect(worker2?.position.y).toBe(worker1!.position.y + 260);
    expect(worker3?.position.y).toBe(worker2!.position.y + 260);

    const cluster = nodes.find((n) => n.id === 'zone-cluster');
    const expectedHeight = ZONE_LAYOUT_CONFIG.cluster.height + (3 - 1) * 260;
    expect(cluster?.style?.height).toBe(expectedHeight);
  });

  it('includes namespace boundary when namespace is not default', () => {
    const nodes = createZoneNodes(1, 'production');

    const nsZone = nodes.find((n) => n.id === 'zone-namespace');
    expect(nsZone).toBeDefined();
    expect(nsZone?.type).toBe('namespaceZone');
    expect(nsZone?.data?.label).toBe('namespace: production');
  });

  it('omits namespace boundary when namespace is default or empty', () => {
    const defaultNodes = createZoneNodes(1, 'default');
    expect(defaultNodes.find((n) => n.id === 'zone-namespace')).toBeUndefined();

    const emptyNodes = createZoneNodes(1, '');
    expect(emptyNodes.find((n) => n.id === 'zone-namespace')).toBeUndefined();
  });

  it('sets draggable and selectable to false for all layout zones', () => {
    const nodes = createZoneNodes(2, 'staging');

    nodes.forEach((node) => {
      expect(node.draggable).toBe(false);
      expect(node.selectable).toBe(false);
    });
  });
});
