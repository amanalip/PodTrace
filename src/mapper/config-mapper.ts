import { Node, Edge } from '@xyflow/react';
import {
  ConfigMapResource,
  SecretResource,
  PersistentVolumeClaimResource,
} from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export function mapConfigResource(
  resource: ConfigMapResource | SecretResource | PersistentVolumeClaimResource,
): {
  nodes: Node[];
  edges: Edge[];
} {
  const resourceName = resource.metadata?.name || 'config';
  const namespace = resource.metadata?.namespace || 'default';
  const kind = resource.kind;

  const zoneNodes = createZoneNodes(1, namespace);

  let resourceSubtitle = 'Configuration Data';
  let volumeSubtitle = 'Projected Volume Mount';
  let dataKeys: string[] = [];

  if (kind === 'ConfigMap') {
    const cm = resource as ConfigMapResource;
    dataKeys = Object.keys(cm.data || {});
    resourceSubtitle = `Keys: ${dataKeys.length > 0 ? dataKeys.join(', ') : 'app.properties'}`;
    volumeSubtitle = 'ConfigMap Volume (/etc/config)';
  } else if (kind === 'Secret') {
    const sec = resource as SecretResource;
    dataKeys = Object.keys(sec.data || sec.stringData || {});
    resourceSubtitle = `Type: ${sec.type || 'Opaque'} (${dataKeys.length} keys)`;
    volumeSubtitle = 'tmpfs In-Memory Mount (/var/run/secrets)';
  } else if (kind === 'PersistentVolumeClaim') {
    const pvc = resource as PersistentVolumeClaimResource;
    const storage = pvc.spec?.resources?.requests?.storage || '10Gi';
    const accessModes = pvc.spec?.accessModes?.join(', ') || 'ReadWriteOnce';
    resourceSubtitle = `${storage} (${accessModes})`;
    volumeSubtitle = 'CSI Persistent Volume (/data)';
  }

  const componentNodes: Node[] = [
    // Workstation
    {
      id: 'node-user',
      type: 'userNode',
      position: { x: 30, y: 80 },
      data: { label: 'Developer', status: 'idle', subtitle: 'Local Shell' },
    },
    {
      id: 'node-kubectl',
      type: 'kubectlNode',
      position: { x: 30, y: 240 },
      data: { label: 'kubectl', status: 'idle', subtitle: 'CLI Client' },
    },

    // Control Plane
    {
      id: 'node-apiserver',
      type: 'apiServerNode',
      position: { x: 380, y: 90 },
      data: { label: 'kube-apiserver', status: 'idle', subtitle: 'Cluster Gateway' },
    },
    {
      id: 'node-etcd',
      type: 'etcdNode',
      position: { x: 620, y: 90 },
      data: { label: 'etcd', status: 'idle', subtitle: 'Key-Value Store' },
    },

    // Config Object in Namespace
    {
      id: `node-config-${resourceName}`,
      type: 'podNode',
      position: { x: 380, y: 250 },
      data: {
        label: `${kind}: ${resourceName}`,
        status: 'idle',
        subtitle: resourceSubtitle,
        details: { keys: dataKeys },
      },
    },

    // Volume Node
    {
      id: `node-volume-${resourceName}`,
      type: 'podNode',
      position: { x: 620, y: 250 },
      data: {
        label: `Volume: ${resourceName}-vol`,
        status: 'idle',
        subtitle: volumeSubtitle,
      },
    },

    // Worker Node & Pod
    {
      id: 'node-kubelet',
      type: 'kubeletNode',
      position: { x: 885, y: 90 },
      data: { label: 'kubelet', status: 'idle', subtitle: 'Volume & Env Manager' },
    },
    {
      id: `node-pod-consumer`,
      type: 'podNode',
      position: { x: 885, y: 250 },
      data: {
        label: `${resourceName}-pod`,
        status: 'idle',
        subtitle: 'Mounted & Injected Pod',
      },
    },
  ];

  const nodes = [...zoneNodes, ...componentNodes];

  const edges: Edge[] = [
    {
      id: 'edge-user-kubectl',
      source: 'node-user',
      target: 'node-kubectl',
      type: 'flowEdge',
      data: { label: `kubectl apply -f ${resourceName}.yaml`, status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `POST ${kind}`, status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: `Store ${kind} data in etcd`, status: 'inactive' },
    },
    {
      id: 'edge-apiserver-config-obj',
      source: 'node-apiserver',
      target: `node-config-${resourceName}`,
      type: 'flowEdge',
      data: { label: 'Register object in namespace', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-fetch-config',
      source: 'node-kubelet',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `Kubelet fetches ${kind}`, status: 'inactive' },
    },
    {
      id: 'edge-kubelet-prepare-volume',
      source: 'node-kubelet',
      target: `node-volume-${resourceName}`,
      type: 'flowEdge',
      data: { label: 'Prepare volume directory / tmpfs', status: 'inactive' },
    },
    {
      id: 'edge-volume-pod-mount',
      source: `node-volume-${resourceName}`,
      target: 'node-pod-consumer',
      type: 'flowEdge',
      data: { label: 'Mount files & env injection', status: 'inactive' },
    },
  ];

  return { nodes, edges };
}
