export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Control Plane' | 'Worker Node' | 'Networking' | 'Storage & Lifecycle';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Control Plane',
    question: 'Which Kubernetes component is the ONLY one permitted to communicate directly with etcd?',
    options: [
      'kube-scheduler',
      'kube-controller-manager',
      'kube-apiserver',
      'kubelet',
    ],
    correctIndex: 2,
    explanation: 'The kube-apiserver acts as the sole gateway to etcd. No other cluster component communicates with etcd directly.',
  },
  {
    id: 'q2',
    category: 'Control Plane',
    question: 'What happens to currently running Pods if the kube-scheduler crashes or stops running?',
    options: [
      'All running Pods immediately terminate.',
      'Existing Pods continue running, but newly created Pods stay Pending.',
      'Pods restart automatically on other nodes.',
      'Worker nodes disconnect from the cluster.',
    ],
    correctIndex: 1,
    explanation: 'Existing pods continue executing on their assigned worker nodes. Only unscheduled pods lack node binding and remain Pending.',
  },
  {
    id: 'q3',
    category: 'Worker Node',
    question: 'Which component is responsible for executing container health probes (liveness, readiness, startup)?',
    options: [
      'kube-proxy',
      'kubelet',
      'containerd runtime directly',
      'kube-controller-manager',
    ],
    correctIndex: 1,
    explanation: 'Kubelet periodically executes configured HTTP, TCP, or Exec health probes and reports container status back to the API server.',
  },
  {
    id: 'q4',
    category: 'Networking',
    question: 'Which component programs Linux iptables, IPVS, or NFTables kernel packet routing rules for Services?',
    options: [
      'kube-proxy',
      'CoreDNS',
      'kube-scheduler',
      'Flannel / Calico CNI daemon',
    ],
    correctIndex: 0,
    explanation: 'kube-proxy watches Services and EndpointSlices, translating ClusterIP virtual VIPs into local kernel packet forwarding rules.',
  },
  {
    id: 'q5',
    category: 'Storage & Lifecycle',
    question: 'What linux kernel mechanism triggers an exit code 137 (OOMKilled)?',
    options: [
      'Linux CPU scheduler CFS quota exhaustion',
      'Memory cgroup limit exceeded by container processes',
      'Disk partition running out of inodes',
      'Seccomp security profile restriction violation',
    ],
    correctIndex: 1,
    explanation: 'When container processes attempt to allocate memory exceeding their cgroup memory.max limit, the kernel OOM killer terminates the process.',
  },
  {
    id: 'q6',
    category: 'Networking',
    question: 'What object links a Service selector to its matching active Pod IP addresses in modern Kubernetes?',
    options: [
      'IngressRoute',
      'EndpointSlice',
      'ConfigMap',
      'NetworkPolicy',
    ],
    correctIndex: 1,
    explanation: 'EndpointSlice objects group network endpoints for Services, scaling much better than legacy Endpoints objects in large clusters.',
  },
  {
    id: 'q7',
    category: 'Control Plane',
    question: 'Which controller is responsible for creating a new ReplicaSet when a Deployment manifest changes?',
    options: [
      'NodeLifecycleController',
      'DeploymentController inside kube-controller-manager',
      'kube-scheduler',
      'AdmissionController inside kube-apiserver',
    ],
    correctIndex: 1,
    explanation: 'The Deployment controller inside kube-controller-manager manages ReplicaSets for rolling updates and rollbacks.',
  },
  {
    id: 'q8',
    category: 'Worker Node',
    question: 'What API protocol interface does Kubelet use to instruct containerd to launch container sandboxes?',
    options: [
      'Container Storage Interface (CSI)',
      'Container Network Interface (CNI)',
      'Container Runtime Interface (CRI)',
      'gRPC Management Protocol (GMP)',
    ],
    correctIndex: 2,
    explanation: 'Kubelet uses CRI (Container Runtime Interface) gRPC calls to manage container sandboxes and process execution with runtimes like containerd.',
  },
  {
    id: 'q9',
    category: 'Storage & Lifecycle',
    question: 'If a Pod references a missing ConfigMap without "optional: true", what status does it enter?',
    options: [
      'Running',
      'CreateContainerConfigError',
      'OOMKilled',
      'Completed',
    ],
    correctIndex: 1,
    explanation: 'Kubelet fails to prepare the container environment and marks the container with CreateContainerConfigError until the key is found.',
  },
  {
    id: 'q10',
    category: 'Control Plane',
    question: 'Which admission phase can modify and populate default values into a Pod spec before schema storage?',
    options: [
      'Validating Admission Webhooks',
      'Mutating Admission Webhooks',
      'Authorization Webhooks',
      'Authentication Webhooks',
    ],
    correctIndex: 1,
    explanation: 'Mutating Admission Webhooks run first, allowing mutation and defaulting of resource specifications before Validating Webhooks run.',
  },
];
