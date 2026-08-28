export interface ComponentInspectionData {
  name: string;
  binary: string;
  role: string;
  zone: string;
  responsibilities: string[];
  configFlags: Array<{ flag: string; description: string; defaultValue?: string }>;
  metrics: Array<{ name: string; type: string; description: string }>;
  failureModes: Array<{ issue: string; resolution: string }>;
  debugCommands: string[];
  githubUrl: string;
}

export const COMPONENT_INSPECTOR_REGISTRY: Record<string, ComponentInspectionData> = {
  apiServerNode: {
    name: 'kube-apiserver',
    binary: 'kube-apiserver',
    role: 'Central Control Plane REST Gateway',
    zone: 'Control Plane',
    responsibilities: [
      'Authenticates and authorizes all administrative and internal API requests.',
      'Executes admission controller webhooks (Mutating & Validating).',
      'Validates resource specifications and schema conformance.',
      'Acts as the exclusive component communicating with etcd storage.',
    ],
    configFlags: [
      { flag: '--etcd-servers', description: 'List of etcd server endpoints.', defaultValue: 'https://127.0.0.1:2379' },
      { flag: '--enable-admission-plugins', description: 'Admission controllers enabled in order.', defaultValue: 'NodeRestriction,NamespaceLifecycle' },
      { flag: '--service-cluster-ip-range', description: 'CIDR block assigned to Service ClusterIPs.', defaultValue: '10.96.0.0/12' },
      { flag: '--anonymous-auth', description: 'Enables anonymous authentication for health checks.', defaultValue: 'true' },
    ],
    metrics: [
      { name: 'apiserver_request_total', type: 'Counter', description: 'Total HTTP requests processed by code, verb, and resource.' },
      { name: 'apiserver_request_duration_seconds', type: 'Histogram', description: 'Latency breakdown for API request handling.' },
      { name: 'etcd_request_duration_seconds', type: 'Histogram', description: 'Round-trip duration for etcd read/write requests.' },
    ],
    failureModes: [
      { issue: 'High memory usage during large List calls', resolution: 'Enable pagination and limit unindexed watch queries.' },
      { issue: 'etcd connection timeouts', resolution: 'Check network connectivity, certificate validity, and etcd disk IOPS.' },
    ],
    debugCommands: [
      'kubectl get --raw /healthz',
      'kubectl get --raw /metrics | grep apiserver_request_total',
      'journalctl -u kube-apiserver -f',
    ],
    githubUrl: 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-apiserver',
  },
  etcdNode: {
    name: 'etcd',
    binary: 'etcd',
    role: 'Distributed Key-Value Store',
    zone: 'Control Plane',
    responsibilities: [
      'Provides strongly consistent state storage using the Raft consensus algorithm.',
      'Stores all Kubernetes cluster object definitions and persistent metadata.',
      'Supports efficient resource change streaming via gRPC Watch API.',
    ],
    configFlags: [
      { flag: '--data-dir', description: 'Directory on disk storing database snapshot and WAL files.', defaultValue: '/var/lib/etcd' },
      { flag: '--listen-client-urls', description: 'Client URLs accepting API connections.', defaultValue: 'https://127.0.0.1:2379' },
      { flag: '--quota-backend-bytes', description: 'Maximum storage quota for database file before alarm.', defaultValue: '8589934592 (8GB)' },
      { flag: '--auto-compaction-retention', description: 'Frequency of historical revision compaction.', defaultValue: '5m' },
    ],
    metrics: [
      { name: 'etcd_server_has_leader', type: 'Gauge', description: 'Indicates whether the Raft cluster has a recognized leader (1 or 0).' },
      { name: 'etcd_disk_wal_fsync_duration_seconds', type: 'Histogram', description: 'Disk fsync latency for Write-Ahead Log writes.' },
    ],
    failureModes: [
      { issue: 'Database space quota exceeded (alarm: NOSPACE)', resolution: 'Run etcdctl defrag and compact historical revisions.' },
      { issue: 'Slow disk syncs leading to Raft leader elections', resolution: 'Move etcd data directory to dedicated fast NVMe SSD storage.' },
    ],
    debugCommands: [
      'etcdctl endpoint health',
      'etcdctl endpoint status --write-out=table',
      'etcdctl defrag',
    ],
    githubUrl: 'https://github.com/etcd-io/etcd',
  },
  schedulerNode: {
    name: 'kube-scheduler',
    binary: 'kube-scheduler',
    role: 'Workload Placement Engine',
    zone: 'Control Plane',
    responsibilities: [
      'Identifies unscheduled Pods lacking a nodeName assignment.',
      'Filters candidate worker nodes based on resource capacity, affinity, and taints.',
      'Scores eligible nodes using topology balancing and bin-packing algorithms.',
      'Issues a Pod Binding API call committing the selected node.',
    ],
    configFlags: [
      { flag: '--config', description: 'Path to scheduler configuration policy file.', defaultValue: '/etc/kubernetes/kube-scheduler.yaml' },
      { flag: '--leader-elect', description: 'Enables high availability leader election.', defaultValue: 'true' },
    ],
    metrics: [
      { name: 'scheduler_scheduling_attempt_duration_seconds', type: 'Histogram', description: 'Duration of the filter and score scheduling cycles.' },
      { name: 'scheduler_pending_pods', type: 'Gauge', description: 'Number of pods currently queued for placement.' },
    ],
    failureModes: [
      { issue: 'Pods stuck in Pending with FailedScheduling events', resolution: 'Inspect node CPU/memory requests, taints, and nodeSelectors.' },
    ],
    debugCommands: [
      'kubectl get events --field-selector reason=FailedScheduling',
      'journalctl -u kube-scheduler -f',
    ],
    githubUrl: 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-scheduler',
  },
  controllerManagerNode: {
    name: 'kube-controller-manager',
    binary: 'kube-controller-manager',
    role: 'Core Reconciliation Loop Engine',
    zone: 'Control Plane',
    responsibilities: [
      'Executes Deployment, ReplicaSet, StatefulSet, and Job controllers.',
      'Tracks node health through NodeLifecycleController.',
      'Synchronizes Service selectors to EndpointSlice targets.',
      'Handles Namespace deletion and resource garbage collection.',
    ],
    configFlags: [
      { flag: '--controllers', description: 'List of controllers to enable.', defaultValue: '*,bootstrapsigner,tokencleaner' },
      { flag: '--node-monitor-grace-period', description: 'Grace period before marking an unresponsive node Unhealthy.', defaultValue: '40s' },
      { flag: '--pod-eviction-timeout', description: 'Delay before evicting pods from failed nodes.', defaultValue: '5m' },
    ],
    metrics: [
      { name: 'workqueue_depth', type: 'Gauge', description: 'Current depth of controller workqueues.' },
      { name: 'workqueue_work_duration_seconds', type: 'Histogram', description: 'Processing time spent per reconciliation event.' },
    ],
    failureModes: [
      { issue: 'Replication lag or stalled Deployment rollouts', resolution: 'Check controller queue depth metrics and CPU throttling.' },
    ],
    debugCommands: [
      'kubectl get componentstatuses',
      'journalctl -u kube-controller-manager -f',
    ],
    githubUrl: 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-controller-manager',
  },
  kubeletNode: {
    name: 'kubelet',
    binary: 'kubelet',
    role: 'Primary Worker Node Agent',
    zone: 'Worker Node',
    responsibilities: [
      'Watches Pod specifications assigned to this specific node.',
      'Coordinates container sandbox creation via Container Runtime Interface (CRI).',
      'Mounts ConfigMaps, Secrets, emptyDirs, and CSI persistent volumes.',
      'Executes readiness, liveness, and startup health probes.',
      'Reports node and pod status back to the API Server.',
    ],
    configFlags: [
      { flag: '--container-runtime-endpoint', description: 'Unix socket path for the CRI runtime.', defaultValue: 'unix:///run/containerd/containerd.sock' },
      { flag: '--max-pods', description: 'Maximum number of pods allowed on this worker node.', defaultValue: '110' },
      { flag: '--eviction-hard', description: 'Thresholds triggering immediate pod eviction for node protection.', defaultValue: 'memory.available<100Mi,nodefs.available<10%' },
    ],
    metrics: [
      { name: 'kubelet_running_pods', type: 'Gauge', description: 'Number of active pods currently running on this node.' },
      { name: 'kubelet_pleg_relist_duration_seconds', type: 'Histogram', description: 'Pod Lifecycle Event Generator latency duration.' },
    ],
    failureModes: [
      { issue: 'Node status NotReady (PLEG is not healthy)', resolution: 'Investigate runtime socket responsiveness and excessive container churn.' },
      { issue: 'DiskPressure / MemoryPressure evictions', resolution: 'Clean unused container images and adjust eviction thresholds.' },
    ],
    debugCommands: [
      'journalctl -u kubelet -n 100 -f',
      'crictl pods',
      'crictl ps',
    ],
    githubUrl: 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kubelet',
  },
  kubeProxyNode: {
    name: 'kube-proxy',
    binary: 'kube-proxy',
    role: 'Service Networking & Packet Forwarder',
    zone: 'Worker Node',
    responsibilities: [
      'Programs Linux iptables, IPVS, or NFTables kernel packet routing rules.',
      'Translates Service ClusterIP virtual addresses to healthy backend Pod IPs.',
      'Performs layer 4 connection load balancing across available endpoints.',
    ],
    configFlags: [
      { flag: '--proxy-mode', description: 'Networking proxy backend engine.', defaultValue: 'iptables' },
      { flag: '--cluster-cidr', description: 'CIDR range for cluster pods.', defaultValue: '10.244.0.0/16' },
    ],
    metrics: [
      { name: 'kubeproxy_sync_proxy_rules_duration_seconds', type: 'Histogram', description: 'Time taken to synchronize kernel network rules.' },
    ],
    failureModes: [
      { issue: 'Service ClusterIP unreachable despite healthy pods', resolution: 'Verify kube-proxy iptables rules exist with iptables-save | grep KUBE-SERVICES.' },
    ],
    debugCommands: [
      'iptables-save | grep -i KUBE',
      'journalctl -u kube-proxy -f',
    ],
    githubUrl: 'https://github.com/kubernetes/kubernetes/tree/master/cmd/kube-proxy',
  },
  containerRuntimeNode: {
    name: 'containerd / CRI-O',
    binary: 'containerd',
    role: 'Low-level Container Runtime',
    zone: 'Worker Node',
    responsibilities: [
      'Pulls and unpacks OCI container images from remote registries.',
      'Configures Linux kernel cgroups and namespaces for container isolation.',
      'Launches runc runtime processes executing container binaries.',
    ],
    configFlags: [
      { flag: '--config', description: 'Path to containerd TOML configuration file.', defaultValue: '/etc/containerd/config.toml' },
    ],
    metrics: [
      { name: 'container_cpu_usage_seconds_total', type: 'Counter', description: 'Cumulative container CPU usage.' },
      { name: 'container_memory_working_set_bytes', type: 'Gauge', description: 'Current memory working set consumption.' },
    ],
    failureModes: [
      { issue: 'Container failed to start: permission denied / cgroup error', resolution: 'Check systemd cgroup driver configuration alignment in config.toml.' },
    ],
    debugCommands: [
      'crictl info',
      'crictl images',
      'journalctl -u containerd -f',
    ],
    githubUrl: 'https://github.com/containerd/containerd',
  },
  podNode: {
    name: 'Pod / Container Group',
    binary: 'user-application',
    role: 'Atomic Deployable Workload Unit',
    zone: 'Worker Node',
    responsibilities: [
      'Executes user application containers sharing network namespaces and IP address.',
      'Shares storage volumes and IPC namespaces across co-located containers.',
      'Executes initialization containers before main app processes start.',
    ],
    configFlags: [],
    metrics: [
      { name: 'container_network_receive_bytes_total', type: 'Counter', description: 'Incoming network bytes on pod network interface.' },
    ],
    failureModes: [
      { issue: 'CrashLoopBackOff / OOMKilled', resolution: 'Check container logs with kubectl logs and verify resource limit sizing.' },
    ],
    debugCommands: [
      'kubectl describe pod <pod-name>',
      'kubectl logs <pod-name> -c <container-name> --previous',
    ],
    githubUrl: 'https://kubernetes.io/docs/concepts/workloads/pods/',
  },
  userNode: {
    name: 'Developer / Client',
    binary: 'user',
    role: 'Originating Actor',
    zone: 'Workstation',
    responsibilities: [
      'Creates and updates declarative Kubernetes manifest definitions.',
      'Sends operational commands and queries to the cluster.',
    ],
    configFlags: [],
    metrics: [],
    failureModes: [],
    debugCommands: ['kubectl version'],
    githubUrl: 'https://kubernetes.io/',
  },
  kubectlNode: {
    name: 'kubectl',
    binary: 'kubectl',
    role: 'Command Line Client Interface',
    zone: 'Workstation',
    responsibilities: [
      'Parses kubeconfig connection credentials and context settings.',
      'Performs client-side schema validation on manifests.',
      'Translates CLI commands into standard REST API requests.',
    ],
    configFlags: [
      { flag: '--kubeconfig', description: 'Path to cluster credentials file.', defaultValue: '~/.kube/config' },
      { flag: '--namespace', description: 'Target namespace for command scope.', defaultValue: 'default' },
    ],
    metrics: [],
    failureModes: [
      { issue: 'The connection to the server localhost:8080 was refused', resolution: 'Verify ~/.kube/config points to a valid cluster and certificates are valid.' },
    ],
    debugCommands: [
      'kubectl cluster-info',
      'kubectl config get-contexts',
    ],
    githubUrl: 'https://github.com/kubernetes/kubectl',
  },
};

export function getComponentInspectionData(nodeType: string): ComponentInspectionData | null {
  return COMPONENT_INSPECTOR_REGISTRY[nodeType] || null;
}
