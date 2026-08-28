import { Node } from '@xyflow/react';

export interface LayoutBounds {
  width: number;
  height: number;
}

export const ZONE_LAYOUT_CONFIG = {
  workstation: {
    x: 40,
    y: 40,
    width: 320,
    height: 180,
  },
  cluster: {
    x: 400,
    y: 40,
    width: 720,
    height: 560,
  },
  controlPlane: {
    x: 24,
    y: 50,
    width: 672,
    height: 200,
  },
  workerNode: {
    x: 24,
    y: 280,
    width: 672,
    height: 250,
  },
};

export function createZoneNodes(workerNodeCount = 1, namespace = 'default'): Node[] {
  const nodes: Node[] = [
    {
      id: 'zone-workstation',
      type: 'workstationZone',
      position: { x: ZONE_LAYOUT_CONFIG.workstation.x, y: ZONE_LAYOUT_CONFIG.workstation.y },
      style: {
        width: ZONE_LAYOUT_CONFIG.workstation.width,
        height: ZONE_LAYOUT_CONFIG.workstation.height,
      },
      data: { label: 'Local Workstation', zoneType: 'workstation' },
      draggable: false,
      selectable: false,
    },
    {
      id: 'zone-cluster',
      type: 'clusterZone',
      position: { x: ZONE_LAYOUT_CONFIG.cluster.x, y: ZONE_LAYOUT_CONFIG.cluster.y },
      style: {
        width: ZONE_LAYOUT_CONFIG.cluster.width,
        height: ZONE_LAYOUT_CONFIG.cluster.height + (workerNodeCount - 1) * 260,
      },
      data: { label: 'Kubernetes Cluster', zoneType: 'cluster' },
      draggable: false,
      selectable: false,
    },
    {
      id: 'zone-control-plane',
      type: 'controlPlaneZone',
      parentId: 'zone-cluster',
      position: { x: ZONE_LAYOUT_CONFIG.controlPlane.x, y: ZONE_LAYOUT_CONFIG.controlPlane.y },
      style: {
        width: ZONE_LAYOUT_CONFIG.controlPlane.width,
        height: ZONE_LAYOUT_CONFIG.controlPlane.height,
      },
      data: { label: 'Control Plane', zoneType: 'control-plane' },
      draggable: false,
      selectable: false,
    },
  ];

  for (let i = 1; i <= workerNodeCount; i++) {
    const yOffset = ZONE_LAYOUT_CONFIG.workerNode.y + (i - 1) * 260;
    nodes.push({
      id: `zone-worker-node-${i}`,
      type: 'workerNodeZone',
      parentId: 'zone-cluster',
      position: { x: ZONE_LAYOUT_CONFIG.workerNode.x, y: yOffset },
      style: {
        width: ZONE_LAYOUT_CONFIG.workerNode.width,
        height: ZONE_LAYOUT_CONFIG.workerNode.height,
      },
      data: { label: `Worker Node ${i}`, zoneType: 'worker-node' },
      draggable: false,
      selectable: false,
    });
  }

  if (namespace && namespace !== 'default') {
    nodes.push({
      id: 'zone-namespace',
      type: 'namespaceZone',
      parentId: 'zone-cluster',
      position: { x: 16, y: 16 },
      style: { width: 688, height: 528 },
      data: { label: `namespace: ${namespace}`, zoneType: 'namespace' },
      draggable: false,
      selectable: false,
    });
  }

  return nodes;
}
