import { Node, Edge } from '@xyflow/react';
import { IngressResource } from '../parser/resource-types.ts';
import { createZoneNodes } from '../layout/zone-layout.ts';

export function mapIngressResource(ingress: IngressResource): {
  nodes: Node[];
  edges: Edge[];
} {
  const ingressName = ingress.metadata?.name || 'ingress';
  const namespace = ingress.metadata?.namespace || 'default';
  const rules = ingress.spec?.rules || [];
  const firstRule = rules[0];
  const host = firstRule?.host || 'app.example.com';
  const firstPath = firstRule?.http?.paths?.[0];
  const path = firstPath?.path || '/';
  const targetService =
    firstPath?.backend?.service?.name ||
    ingress.spec?.defaultBackend?.service?.name ||
    `${ingressName}-service`;

  const zoneNodes = createZoneNodes(1, namespace);

  const componentNodes: Node[] = [
    // External Client & Workstation
    {
      id: 'node-external-client',
      type: 'userNode',
      position: { x: 30, y: 60 },
      data: { label: 'External Client', status: 'idle', subtitle: 'Public Internet' },
    },
    {
      id: 'node-kubectl',
      type: 'kubectlNode',
      position: { x: 30, y: 220 },
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

    // Ingress Controller (Edge Load Balancer)
    {
      id: 'node-ingress-controller',
      type: 'controllerManagerNode',
      position: { x: 380, y: 250 },
      data: {
        label: 'Ingress Controller',
        status: 'idle',
        subtitle: 'ingress-nginx / Envoy',
        details: { host, path, ingressClass: ingress.spec?.ingressClassName || 'nginx' },
      },
    },

    // Ingress & Target Service in Namespace
    {
      id: `node-ingress-${ingressName}`,
      type: 'podNode',
      position: { x: 620, y: 250 },
      data: {
        label: `Ingress: ${ingressName}`,
        status: 'idle',
        subtitle: `${host}${path}`,
        details: { rules },
      },
    },
    {
      id: `node-service-${targetService}`,
      type: 'podNode',
      position: { x: 885, y: 90 },
      data: {
        label: `Service: ${targetService}`,
        status: 'idle',
        subtitle: 'ClusterIP: 10.96.4.18',
      },
    },

    // Backend Pod
    {
      id: `node-pod-${targetService}-backend`,
      type: 'podNode',
      position: { x: 885, y: 250 },
      data: {
        label: `${targetService}-backend`,
        status: 'idle',
        subtitle: 'Pod IP: 10.244.1.20:8080',
      },
    },
  ];

  const nodes = [...zoneNodes, ...componentNodes];

  const edges: Edge[] = [
    {
      id: 'edge-user-kubectl',
      source: 'node-external-client',
      target: 'node-kubectl',
      type: 'flowEdge',
      data: { label: `kubectl apply -f ${ingressName}.yaml`, status: 'inactive' },
    },
    {
      id: 'edge-kubectl-apiserver',
      source: 'node-kubectl',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'POST /apis/networking.k8s.io/v1/ingresses', status: 'inactive' },
    },
    {
      id: 'edge-apiserver-etcd',
      source: 'node-apiserver',
      target: 'node-etcd',
      type: 'flowEdge',
      data: { label: 'Store Ingress routing rules', status: 'inactive' },
    },
    {
      id: 'edge-ic-apiserver-watch',
      source: 'node-ingress-controller',
      target: 'node-apiserver',
      type: 'flowEdge',
      data: { label: 'Watch Ingress changes', status: 'inactive' },
    },
    {
      id: 'edge-ic-update-rules',
      source: 'node-ingress-controller',
      target: `node-ingress-${ingressName}`,
      type: 'flowEdge',
      data: { label: `Reload config: ${host}${path}`, status: 'inactive' },
    },
    {
      id: 'edge-client-ic-request',
      source: 'node-external-client',
      target: 'node-ingress-controller',
      type: 'flowEdge',
      data: { label: `HTTP GET http://${host}${path}`, status: 'inactive' },
    },
    {
      id: 'edge-ic-service-lookup',
      source: 'node-ingress-controller',
      target: `node-service-${targetService}`,
      type: 'flowEdge',
      data: { label: `Resolve backend: ${targetService}:80`, status: 'inactive' },
    },
    {
      id: 'edge-ic-proxy-pod',
      source: 'node-ingress-controller',
      target: `node-pod-${targetService}-backend`,
      type: 'flowEdge',
      data: { label: 'Reverse proxy -> 10.244.1.20:8080', status: 'inactive' },
    },
    {
      id: 'edge-pod-ic-response',
      source: `node-pod-${targetService}-backend`,
      target: 'node-ingress-controller',
      type: 'flowEdge',
      data: { label: 'HTTP 200 OK (Pod response)', status: 'inactive' },
    },
    {
      id: 'edge-ic-client-response',
      source: 'node-ingress-controller',
      target: 'node-external-client',
      type: 'flowEdge',
      data: { label: 'HTTP 200 OK (Client response)', status: 'inactive' },
    },
  ];

  return { nodes, edges };
}
