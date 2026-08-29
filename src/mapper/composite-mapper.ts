import { Node, Edge } from '@xyflow/react';
import { K8sResource } from '../model/types.ts';
import {
  DeploymentResource,
  ServiceResource,
  IngressResource,
  ConfigMapResource,
  SecretResource,
} from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export function mapCompositeResources(resources: K8sResource[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const deployment = resources.find((r) => r.kind === 'Deployment') as DeploymentResource | undefined;
  const service = resources.find((r) => r.kind === 'Service') as ServiceResource | undefined;
  const ingress = resources.find((r) => r.kind === 'Ingress') as IngressResource | undefined;
  const configMap = resources.find((r) => r.kind === 'ConfigMap') as ConfigMapResource | undefined;
  const secret = resources.find((r) => r.kind === 'Secret') as SecretResource | undefined;

  const namespace = deployment?.metadata?.namespace || service?.metadata?.namespace || 'default';
  const depName = deployment?.metadata?.name || 'app-deployment';
  const svcName = service?.metadata?.name || `${depName}-service`;
  const ingName = ingress?.metadata?.name || `${depName}-ingress`;
  const cmName = configMap?.metadata?.name || 'config';
  const secretName = secret?.metadata?.name || 'secret';
  const replicas = deployment?.spec?.replicas ?? 2;

  const zoneNodes = createZoneNodes(2, namespace);

  const componentNodes: Node[] = [
    // Workstation
    {
      id: 'node-user',
      type: 'userNode',
      position: { x: 30, y: 80 },
      data: { label: 'Developer', status: 'idle', subtitle: 'Multi-manifest Apply' },
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
      position: { x: 380, y: 230 },
      data: { label: 'kube-controller-manager', status: 'idle', subtitle: 'Workload & Endpoint Controllers' },
    },
    {
      id: 'node-scheduler',
      type: 'schedulerNode',
      position: { x: 620, y: 230 },
      data: { label: 'kube-scheduler', status: 'idle', subtitle: 'Pod Scheduler' },
    },

    // Ingress Controller
    {
      id: 'node-ingress-controller',
      type: 'controllerManagerNode',
      position: { x: 380, y: 370 },
      data: { label: 'Ingress Controller', status: 'idle', subtitle: 'Edge Reverse Proxy' },
    },

    // Ingress Object
    ...(ingress
      ? [
          {
            id: `node-ingress-${ingName}`,
            type: 'podNode' as const,
            position: { x: 620, y: 370 },
            data: {
              label: `Ingress: ${ingName}`,
              status: 'idle' as const,
              subtitle: 'Host & Path Rules',
            },
          },
        ]
      : []),

    // Service Object
    ...(service
      ? [
          {
            id: `node-service-${svcName}`,
            type: 'podNode' as const,
            position: { x: 620, y: 490 },
            data: {
              label: `Service: ${svcName}`,
              status: 'idle' as const,
              subtitle: 'ClusterIP: 10.96.0.100',
            },
          },
        ]
      : []),

    // ConfigMap / Secret
    ...(configMap
      ? [
          {
            id: `node-config-${cmName}`,
            type: 'podNode' as const,
            position: { x: 380, y: 490 },
            data: {
              label: `ConfigMap: ${cmName}`,
              status: 'idle' as const,
              subtitle: 'Mounted Configuration',
            },
          },
        ]
      : []),

    ...(secret
      ? [
          {
            id: `node-secret-${secretName}`,
            type: 'podNode' as const,
            position: { x: 380, y: 610 },
            data: {
              label: `Secret: ${secretName}`,
              status: 'idle' as const,
              subtitle: 'In-Memory Credentials',
            },
          },
        ]
      : []),

    // Worker Node 1
    {
      id: 'node-kubelet-1',
      type: 'kubeletNode',
      position: { x: 885, y: 90 },
      data: { label: 'kubelet (node-1)', status: 'idle', subtitle: 'Node Agent' },
    },
    {
      id: 'node-kubeproxy-1',
      type: 'kubeProxyNode',
      position: { x: 885, y: 230 },
      data: { label: 'kube-proxy (node-1)', status: 'idle', subtitle: 'iptables rules' },
    },
    {
      id: `node-pod-${depName}-1`,
      type: 'podNode',
      position: { x: 885, y: 370 },
      data: {
        label: `${depName}-pod-1`,
        status: 'idle',
        subtitle: '10.244.1.15 (Ready)',
      },
    },

    // Worker Node 2
    {
      id: 'node-kubelet-2',
      type: 'kubeletNode',
      position: { x: 1165, y: 90 },
      data: { label: 'kubelet (node-2)', status: 'idle', subtitle: 'Node Agent' },
    },
    {
      id: 'node-kubeproxy-2',
      type: 'kubeProxyNode',
      position: { x: 1165, y: 230 },
      data: { label: 'kube-proxy (node-2)', status: 'idle', subtitle: 'iptables rules' },
    },
    {
      id: `node-pod-${depName}-2`,
      type: 'podNode',
      position: { x: 1165, y: 370 },
      data: {
        label: `${depName}-pod-2`,
        status: 'idle',
        subtitle: '10.244.2.22 (Ready)',
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
      data: { label: 'kubectl apply -f manifest.yaml (multi-doc)', status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `POST ${resources.length} resources`, status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: 'Persist all objects', status: 'inactive' },
    },
    {
      id: 'edge-cm-create-pods',
      source: 'node-controllermanager',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `Create ${replicas} Pods from Deployment`, status: 'inactive' },
    },
    {
      id: 'edge-scheduler-assign',
      source: 'node-scheduler',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Bind Pods to Node 1 & 2', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-start-1',
      source: 'node-kubelet-1',
      target: `node-pod-${depName}-1`,
      type: 'flowEdge',
      data: { label: 'RunPodSandbox (node-1)', status: 'inactive' },
    },
    {
      id: 'edge-kubelet-start-2',
      source: 'node-kubelet-2',
      target: `node-pod-${depName}-2`,
      type: 'flowEdge',
      data: { label: 'RunPodSandbox (node-2)', status: 'inactive' },
    },
  ];

  if (service) {
    edges.push({
      id: 'edge-service-pods',
      source: `node-service-${svcName}`,
      target: `node-pod-${depName}-1`,
      type: 'flowEdge',
      data: { label: 'Selector matches Deployment Pods', status: 'inactive' },
    });
  }

  if (ingress && service) {
    edges.push({
      id: 'edge-ingress-service',
      source: `node-ingress-${ingName}`,
      target: `node-service-${svcName}`,
      type: 'flowEdge',
      data: { label: `Routes to ${svcName}:80`, status: 'inactive' },
    });
  }

  if (configMap) {
    edges.push({
      id: 'edge-config-pod-mount',
      source: `node-config-${cmName}`,
      target: `node-pod-${depName}-1`,
      type: 'flowEdge',
      data: { label: 'Volume mount / envFrom', status: 'inactive' },
    });
  }

  return { nodes, edges };
}
