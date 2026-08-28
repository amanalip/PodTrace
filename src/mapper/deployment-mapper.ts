import { Node, Edge } from '@xyflow/react';
import { DeploymentResource } from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export function mapDeploymentResource(deployment: DeploymentResource): {
  nodes: Node[];
  edges: Edge[];
} {
  const deploymentName = deployment.metadata?.name || 'deployment';
  const namespace = deployment.metadata?.namespace || 'default';
  const replicas = deployment.spec?.replicas ?? 3;
  const containers = deployment.spec?.template?.spec?.containers || [];

  // Multi-node zones: Worker Node 1 and Worker Node 2
  const zoneNodes = createZoneNodes(2, namespace);

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
    {
      id: 'node-controllermanager',
      type: 'controllerManagerNode',
      position: { x: 380, y: 250 },
      data: { label: 'kube-controller-manager', status: 'idle', subtitle: 'Deployment & RS Controllers' },
    },
    {
      id: 'node-scheduler',
      type: 'schedulerNode',
      position: { x: 620, y: 250 },
      data: { label: 'kube-scheduler', status: 'idle', subtitle: 'Node Selector' },
    },

    // Worker Node 1
    {
      id: 'node-kubelet-1',
      type: 'kubeletNode',
      position: { x: 885, y: 90 },
      data: { label: 'kubelet (node-1)', status: 'idle', subtitle: 'Node Agent' },
    },
    {
      id: 'node-containerruntime-1',
      type: 'containerRuntimeNode',
      position: { x: 885, y: 230 },
      data: { label: 'containerd (node-1)', status: 'idle', subtitle: 'CRI Runtime' },
    },

    // Worker Node 2
    {
      id: 'node-kubelet-2',
      type: 'kubeletNode',
      position: { x: 1165, y: 90 },
      data: { label: 'kubelet (node-2)', status: 'idle', subtitle: 'Node Agent' },
    },
    {
      id: 'node-containerruntime-2',
      type: 'containerRuntimeNode',
      position: { x: 1165, y: 230 },
      data: { label: 'containerd (node-2)', status: 'idle', subtitle: 'CRI Runtime' },
    },
  ];

  // Pod nodes distributed across worker nodes
  const podNodes: Node[] = [];
  for (let i = 0; i < replicas; i++) {
    const nodeIndex = (i % 2) + 1; // Alternates between node 1 and node 2
    const yOffset = 370 + Math.floor(i / 2) * 90;
    const xPos = nodeIndex === 1 ? 885 : 1165;
    const podId = `node-pod-${deploymentName}-${i + 1}`;

    podNodes.push({
      id: podId,
      type: 'podNode',
      position: { x: xPos, y: yOffset },
      data: {
        label: `${deploymentName}-${i + 1}`,
        status: 'idle',
        subtitle: `Pod (on node-${nodeIndex})`,
        details: { containers },
      },
    });
  }

  const nodes = [...zoneNodes, ...componentNodes, ...podNodes];

  const edges: Edge[] = [
    {
      id: 'edge-user-kubectl',
      source: 'node-user',
      target: 'node-kubectl',
      type: 'flowEdge',
      data: { label: `kubectl apply -f ${deploymentName}.yaml`, status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'POST /apis/apps/v1/deployments', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: 'Store Deployment spec', status: 'inactive' },
    },
    {
      id: 'edge-cm-apiserver-watch',
      source: 'node-controllermanager',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Deployment Controller watch', status: 'inactive' },
    },
    {
      id: 'edge-cm-create-rs',
      source: 'node-controllermanager',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Create ReplicaSet', status: 'inactive' },
    },
    {
      id: 'edge-cm-create-pods',
      source: 'node-controllermanager',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `Create ${replicas} Pods`, status: 'inactive' },
    },
    {
      id: 'edge-scheduler-apiserver',
      source: 'node-scheduler',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Assign Pods to Node 1 & 2', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-kubelet-1',
      source: 'node-apiserver',
      target: 'node-kubelet-1',
      type: 'flowEdge',
      data: { label: 'Pod assignment (node-1)', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-kubelet-2',
      source: 'node-apiserver',
      target: 'node-kubelet-2',
      type: 'flowEdge',
      data: { label: 'Pod assignment (node-2)', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-runtime-1',
      source: 'node-kubelet-1',
      target: 'node-containerruntime-1',
      type: 'flowEdge',
      data: { label: 'CRI RunPodSandbox (node-1)', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-runtime-2',
      source: 'node-kubelet-2',
      target: 'node-containerruntime-2',
      type: 'flowEdge',
      data: { label: 'CRI RunPodSandbox (node-2)', status: 'inactive' },
    },
    {
      id: 'edge-runtime-pods-1',
      source: 'node-containerruntime-1',
      target: `node-pod-${deploymentName}-1`,
      type: 'flowEdge',
      data: { label: 'Start containers (node-1)', status: 'inactive' },
    },
  ];

  if (replicas > 1) {
    edges.push({
      id: 'edge-runtime-pods-2',
      source: 'node-containerruntime-2',
      target: `node-pod-${deploymentName}-2`,
      type: 'flowEdge',
      data: { label: 'Start containers (node-2)', status: 'inactive' },
    });
  }

  return { nodes, edges };
}
