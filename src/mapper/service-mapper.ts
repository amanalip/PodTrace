import { Node, Edge } from '@xyflow/react';
import { ServiceResource } from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export function mapServiceResource(service: ServiceResource): {
  nodes: Node[];
  edges: Edge[];
} {
  const serviceName = service.metadata?.name || 'service';
  const namespace = service.metadata?.namespace || 'default';
  const serviceType = service.spec?.type || 'ClusterIP';
  const clusterIP = service.spec?.clusterIP || '10.96.0.42';
  const ports = service.spec?.ports || [{ port: 80, targetPort: 8080, protocol: 'TCP' }];
  const selector = service.spec?.selector || { app: serviceName };

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
      data: { label: 'kube-controller-manager', status: 'idle', subtitle: 'EndpointSlice Controller' },
    },
    {
      id: 'node-coredns',
      type: 'apiServerNode',
      position: { x: 620, y: 250 },
      data: { label: 'CoreDNS', status: 'idle', subtitle: 'Cluster DNS Provider' },
    },

    // Service & EndpointSlice in Namespace
    {
      id: `node-service-${serviceName}`,
      type: 'podNode',
      position: { x: 885, y: 90 },
      data: {
        label: `Service: ${serviceName}`,
        status: 'idle',
        subtitle: `${serviceType} (${clusterIP})`,
        details: { ports, selector, clusterIP },
      },
    },
    {
      id: `node-endpointslice-${serviceName}`,
      type: 'podNode',
      position: { x: 1165, y: 90 },
      data: {
        label: `EndpointSlice: ${serviceName}`,
        status: 'idle',
        subtitle: 'Matched 2 Endpoints',
        details: { endpoints: ['10.244.1.5:8080', '10.244.2.8:8080'] },
      },
    },

    // Worker Node 1
    {
      id: 'node-kubeproxy-1',
      type: 'kubeProxyNode',
      position: { x: 885, y: 230 },
      data: { label: 'kube-proxy (node-1)', status: 'idle', subtitle: 'iptables / IPVS' },
    },
    {
      id: 'node-pod-backend-1',
      type: 'podNode',
      position: { x: 885, y: 370 },
      data: {
        label: `${serviceName}-backend-1`,
        status: 'idle',
        subtitle: 'Pod IP: 10.244.1.5',
      },
    },

    // Worker Node 2
    {
      id: 'node-kubeproxy-2',
      type: 'kubeProxyNode',
      position: { x: 1165, y: 230 },
      data: { label: 'kube-proxy (node-2)', status: 'idle', subtitle: 'iptables / IPVS' },
    },
    {
      id: 'node-pod-backend-2',
      type: 'podNode',
      position: { x: 1165, y: 370 },
      data: {
        label: `${serviceName}-backend-2`,
        status: 'idle',
        subtitle: 'Pod IP: 10.244.2.8',
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
      data: { label: `kubectl apply -f ${serviceName}.yaml`, status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'POST /api/v1/services', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: `Store Service & ClusterIP ${clusterIP}`, status: 'inactive' },
    },
    {
      id: 'edge-cm-ep-controller',
      source: 'node-controllermanager',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'EndpointSlice Controller watch', status: 'inactive' },
    },
    {
      id: 'edge-cm-create-epslice',
      source: 'node-controllermanager',
      target: `node-endpointslice-${serviceName}`,
      type: 'flowEdge',
      data: { label: 'Create EndpointSlice with Pod IPs', status: 'inactive' },
    },
    {
      id: 'edge-service-epslice',
      source: `node-service-${serviceName}`,
      target: `node-endpointslice-${serviceName}`,
      type: 'flowEdge',
      data: { label: 'Selector matches 2 Pods', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-proxy-1',
      source: 'node-apiserver',
      target: 'node-kubeproxy-1',
      type: 'flowEdge',
      data: { label: 'Watch EndpointSlice (node-1)', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-proxy-2',
      source: 'node-apiserver',
      target: 'node-kubeproxy-2',
      type: 'flowEdge',
      data: { label: 'Watch EndpointSlice (node-2)', status: 'inactive' },
    },
    {
      id: 'edge-proxy-rules-1',
      source: 'node-kubeproxy-1',
      target: 'node-pod-backend-1',
      type: 'flowEdge',
      data: { label: 'iptables DNAT -> 10.244.1.5', status: 'inactive' },
    },
    {
      id: 'edge-proxy-rules-2',
      source: 'node-kubeproxy-2',
      target: 'node-pod-backend-2',
      type: 'flowEdge',
      data: { label: 'iptables DNAT -> 10.244.2.8', status: 'inactive' },
    },
    {
      id: 'edge-coredns-watch',
      source: 'node-coredns',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: `Register ${serviceName}.${namespace}.svc`, status: 'inactive' },
    },
  ];

  return { nodes, edges };
}
