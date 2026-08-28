import { Node, Edge } from '@xyflow/react';

export const STATIC_INITIAL_NODES: Node[] = [
  // Zones
  {
    id: 'zone-workstation',
    type: 'workstationZone',
    position: { x: 30, y: 30 },
    style: { width: 340, height: 160 },
    data: { label: 'Local Workstation' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'zone-cluster',
    type: 'clusterZone',
    position: { x: 420, y: 30 },
    style: { width: 680, height: 520 },
    data: { label: 'Kubernetes Cluster' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'zone-control-plane',
    type: 'controlPlaneZone',
    parentId: 'zone-cluster',
    position: { x: 20, y: 40 },
    style: { width: 640, height: 180 },
    data: { label: 'Control Plane' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'zone-worker-node',
    type: 'workerNodeZone',
    parentId: 'zone-cluster',
    position: { x: 20, y: 250 },
    style: { width: 640, height: 240 },
    data: { label: 'Worker Node 1' },
    draggable: false,
    selectable: false,
  },

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
    position: { x: 180, y: 50 },
    data: { label: 'kubectl', subLabel: 'CLI Client', status: 'idle' },
  },

  // Control Plane Nodes
  {
    id: 'node-apiserver',
    type: 'apiServerNode',
    parentId: 'zone-control-plane',
    position: { x: 20, y: 50 },
    data: { label: 'API Server', subLabel: 'kube-apiserver', status: 'idle' },
  },
  {
    id: 'node-etcd',
    type: 'etcdNode',
    parentId: 'zone-control-plane',
    position: { x: 220, y: 50 },
    data: { label: 'etcd', subLabel: 'Cluster Store', status: 'idle' },
  },
  {
    id: 'node-scheduler',
    type: 'schedulerNode',
    parentId: 'zone-control-plane',
    position: { x: 420, y: 50 },
    data: { label: 'Scheduler', subLabel: 'kube-scheduler', status: 'idle' },
  },

  // Worker Node Nodes
  {
    id: 'node-kubelet',
    type: 'kubeletNode',
    parentId: 'zone-worker-node',
    position: { x: 20, y: 50 },
    data: { label: 'Kubelet', subLabel: 'Node Agent', status: 'idle' },
  },
  {
    id: 'node-containerruntime',
    type: 'containerRuntimeNode',
    parentId: 'zone-worker-node',
    position: { x: 220, y: 50 },
    data: { label: 'Container Runtime', subLabel: 'containerd', status: 'idle' },
  },
  {
    id: 'node-kubeproxy',
    type: 'kubeProxyNode',
    parentId: 'zone-worker-node',
    position: { x: 20, y: 140 },
    data: { label: 'kube-proxy', subLabel: 'iptables rules', status: 'idle' },
  },
  {
    id: 'node-pod',
    type: 'podNode',
    parentId: 'zone-worker-node',
    position: { x: 420, y: 50 },
    data: {
      label: 'nginx-pod',
      subLabel: 'Pod (Running)',
      status: 'idle',
      details: { containers: [{ name: 'nginx', image: 'nginx:1.25' }] },
    },
  },
];

export const STATIC_INITIAL_EDGES: Edge[] = [
  {
    id: 'edge-user-kubectl',
    source: 'node-user',
    target: 'node-kubectl',
    type: 'flowEdge',
    data: { label: 'Runs kubectl apply', status: 'inactive' },
  },
  {
    id: 'edge-kubectl-apiserver',
    source: 'node-kubectl',
    target: 'node-apiserver',
    type: 'flowEdge',
    data: { label: 'Sends manifest', status: 'inactive' },
  },
  {
    id: 'edge-apiserver-etcd',
    source: 'node-apiserver',
    target: 'node-etcd',
    type: 'flowEdge',
    data: { label: 'Stores spec', status: 'inactive' },
  },
  {
    id: 'edge-scheduler-apiserver',
    source: 'node-scheduler',
    target: 'node-apiserver',
    type: 'flowEdge',
    data: { label: 'Assigns node', status: 'inactive' },
  },
  {
    id: 'edge-apiserver-kubelet',
    source: 'node-apiserver',
    target: 'node-kubelet',
    type: 'flowEdge',
    data: { label: 'Notifies pod spec', status: 'inactive' },
  },
  {
    id: 'edge-kubelet-runtime',
    source: 'node-kubelet',
    target: 'node-containerruntime',
    type: 'flowEdge',
    data: { label: 'Pulls & creates', status: 'inactive' },
  },
  {
    id: 'edge-runtime-pod',
    source: 'node-containerruntime',
    target: 'node-pod',
    type: 'flowEdge',
    data: { label: 'Container starts', status: 'inactive' },
  },
  {
    id: 'edge-proxy-pod',
    source: 'node-kubeproxy',
    target: 'node-pod',
    type: 'flowEdge',
    data: { label: 'Programs network', status: 'inactive' },
  },
];
