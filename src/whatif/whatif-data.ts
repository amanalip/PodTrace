import { WhatIfScenario } from './whatif-types.ts';

export const WHAT_IF_SCENARIOS: WhatIfScenario[] = [
  {
    id: 'apiserver-down',
    title: 'What if the API Server goes down?',
    category: 'control-plane',
    description: 'Simulates complete failure of kube-apiserver across control plane nodes.',
    affectedNodeIds: ['node-apiserver', 'node-kubectl'],
    nodeStatusOverrides: {
      'node-apiserver': 'error',
      'node-kubectl': 'idle',
      'node-scheduler': 'warning',
      'node-controllermanager': 'warning',
    },
    edgeStatusOverrides: {
      'edge-kubectl-apiserver': 'error',
      'edge-scheduler-apiserver': 'error',
      'edge-controller-apiserver': 'error',
      'edge-apiserver-kubelet': 'error',
    },
    consequences: [
      'kubectl and CI/CD pipelines cannot connect (connection refused on 6443).',
      'Kubelet and controllers cannot sync status or receive new workload definitions.',
      'Existing running Pods continue executing normally on worker nodes.',
      'Auto-healing and automated pod restart scheduling are paused.',
    ],
    mitigation: 'Run high availability control plane with 3 API servers behind a layer 4 load balancer (HAProxy, Keepalived, or Cloud NLB).',
  },
  {
    id: 'worker-node-fail',
    title: 'What if a Worker Node fails completely?',
    category: 'worker-node',
    description: 'Simulates physical server power loss or kernel panic on a worker node.',
    affectedNodeIds: ['node-kubelet', 'node-pod', 'node-runtime', 'node-kubeproxy'],
    nodeStatusOverrides: {
      'node-kubelet': 'error',
      'node-pod': 'error',
      'node-runtime': 'idle',
      'node-kubeproxy': 'idle',
    },
    edgeStatusOverrides: {
      'edge-apiserver-kubelet': 'error',
    },
    consequences: [
      'Node stops sending heartbeats (Lease object renewals cease).',
      'After 40s (node-monitor-grace-period), controller manager marks node as NotReady.',
      'After 5m (pod-eviction-timeout), pods are scheduled for eviction and recreated on healthy nodes.',
      'Persistent volume attachments are detached and reattached to the destination node.',
    ],
    mitigation: 'Distribute replicas across multiple availability zones and configure PodDisruptionBudgets.',
  },
  {
    id: 'kubelet-unresponsive',
    title: 'What if Kubelet stops responding (PLEG failure)?',
    category: 'worker-node',
    description: 'Simulates a deadlock in the Kubelet Pod Lifecycle Event Generator due to container runtime socket delays.',
    affectedNodeIds: ['node-kubelet'],
    nodeStatusOverrides: {
      'node-kubelet': 'error',
      'node-runtime': 'warning',
    },
    edgeStatusOverrides: {
      'edge-kubelet-runtime': 'error',
    },
    consequences: [
      'Kubelet cannot detect container crashes or evaluate health probes.',
      'Node status transitions to NotReady with condition "PLEG is not healthy".',
      'Existing containers continue running, but no new containers can start.',
    ],
    mitigation: 'Monitor PLEG relist latency metrics and maintain up-to-date containerd runtime versions with proper cgroup configurations.',
  },
  {
    id: 'etcd-quorum-loss',
    title: 'What if etcd loses quorum?',
    category: 'control-plane',
    description: 'Simulates network partition or failure of 2 out of 3 etcd cluster members.',
    affectedNodeIds: ['node-etcd', 'node-apiserver'],
    nodeStatusOverrides: {
      'node-etcd': 'error',
      'node-apiserver': 'warning',
    },
    edgeStatusOverrides: {
      'edge-apiserver-etcd': 'error',
    },
    consequences: [
      'etcd rejects all write requests (mutations, pod creations, and status updates fail).',
      'Read queries configured with serializable consistency may return stale data.',
      'API server returns HTTP 500 Internal Server Error for resource updates.',
    ],
    mitigation: 'Deploy odd number of etcd members (3 or 5) across distinct failure domains and run scheduled automated snapshots.',
  },
  {
    id: 'coredns-crash',
    title: 'What if CoreDNS crashes?',
    category: 'networking',
    description: 'Simulates crash of all CoreDNS pods inside the kube-system namespace.',
    affectedNodeIds: ['node-kubeproxy'],
    nodeStatusOverrides: {
      'node-kubeproxy': 'warning',
    },
    consequences: [
      'Internal Kubernetes service discovery (e.g. backend.default.svc.cluster.local) fails completely.',
      'Direct IP-to-IP pod communications continue working without disruption.',
      'External domain lookups from inside pods fail if routed through cluster DNS.',
    ],
    mitigation: 'Run NodeLocal DNSCache on every worker node and configure CoreDNS autoscaling based on cluster node count.',
  },
];

export function getWhatIfScenario(id: string): WhatIfScenario | null {
  return WHAT_IF_SCENARIOS.find((s) => s.id === id) || null;
}
