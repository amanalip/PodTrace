import { Node, Edge } from '@xyflow/react';
import { PodResource } from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export interface PodMapperResult {
  nodes: Node[];
  edges: Edge[];
}

export function mapPodResource(pod: PodResource): PodMapperResult {
  const podName = pod.metadata?.name || 'pod';
  const namespace = pod.metadata?.namespace || 'default';
  const containers = (pod.spec?.containers || []).map((c) => ({
    name: c.name,
    image: c.image,
  }));

  const zoneNodes = createZoneNodes(1, namespace);

  const componentNodes: Node[] = [
    // Workstation Nodes
    {
      id: 'node-user',
      type: 'userNode',
      parentId: 'zone-workstation',
      position: { x: 20, y: 50 },
      data: { label: 'Developer', subLabel: 'Workstation', status: 'idle' },
    },
    {
      id: 'node-kubectl',
      type: 'kubectlNode',
      parentId: 'zone-workstation',
      position: { x: 170, y: 50 },
      data: { label: 'kubectl', subLabel: 'CLI Client', status: 'idle' },
    },

    // Control Plane Nodes
    {
      id: 'node-apiserver',
      type: 'apiServerNode',
      parentId: 'zone-control-plane',
      position: { x: 30, y: 55 },
      data: { label: 'API Server', subLabel: 'kube-apiserver', status: 'idle' },
    },
    {
      id: 'node-etcd',
      type: 'etcdNode',
      parentId: 'zone-control-plane',
      position: { x: 245, y: 55 },
      data: { label: 'etcd', subLabel: 'Cluster Store', status: 'idle' },
    },
    {
      id: 'node-scheduler',
      type: 'schedulerNode',
      parentId: 'zone-control-plane',
      position: { x: 460, y: 55 },
      data: { label: 'Scheduler', subLabel: 'kube-scheduler', status: 'idle' },
    },

    // Worker Node Nodes
    {
      id: 'node-kubelet',
      type: 'kubeletNode',
      parentId: 'zone-worker-node-1',
      position: { x: 30, y: 45 },
      data: { label: 'Kubelet', subLabel: 'Node Agent', status: 'idle' },
    },
    {
      id: 'node-containerruntime',
      type: 'containerRuntimeNode',
      parentId: 'zone-worker-node-1',
      position: { x: 245, y: 45 },
      data: { label: 'Container Runtime', subLabel: 'containerd / CRI', status: 'idle' },
    },
    {
      id: 'node-kubeproxy',
      type: 'kubeProxyNode',
      parentId: 'zone-worker-node-1',
      position: { x: 30, y: 135 },
      data: { label: 'kube-proxy', subLabel: 'iptables rules', status: 'idle' },
    },
    {
      id: `node-pod-${podName}`,
      type: 'podNode',
      parentId: 'zone-worker-node-1',
      position: { x: 460, y: 45 },
      data: {
        label: podName,
        subLabel: 'Pod (Pending)',
        status: 'idle',
        details: { containers, labels: pod.metadata?.labels },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: 'edge-user-kubectl',
      source: 'node-user',
      target: 'node-kubectl',
      type: 'flowEdge',
      data: { label: `kubectl apply -f ${podName}.yaml`, status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'POST /api/v1/namespaces/default/pods', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: 'Validates and writes spec', status: 'inactive' },
    },
    {
      id: 'edge-scheduler-apiserver-watch',
      source: 'node-scheduler',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Watches for unscheduled pods', status: 'inactive' },
    },
    {
      id: 'edge-scheduler-apiserver-bind',
      source: 'node-scheduler',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Binds pod to node-1', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-kubelet',
      source: 'node-apiserver',
      target: 'node-kubelet',
      type: 'flowEdge',
      data: { label: 'Notifies node of assignment', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-runtime',
      source: 'node-kubelet',
      target: 'node-containerruntime',
      type: 'flowEdge',
      data: { label: 'Pulls image & creates container', status: 'inactive' },
    },
    {
      id: 'edge-runtime-pod',
      source: 'node-containerruntime',
      target: `node-pod-${podName}`,
      type: 'flowEdge',
      data: { label: 'Container starts (Running)', status: 'inactive' },
    },
    {
      id: 'edge-proxy-pod',
      source: 'node-kubeproxy',
      target: `node-pod-${podName}`,
      type: 'flowEdge',
      data: { label: 'Configures iptables rules', status: 'inactive' },
    },
  ];

  return {
    nodes: [...zoneNodes, ...componentNodes],
    edges,
  };
}
