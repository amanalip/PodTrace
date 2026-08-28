import { ConceptCardData } from '../model/types.ts';

export const CONCEPT_CARDS: ConceptCardData[] = [
  {
    id: 'api-server',
    title: 'What is the API Server?',
    definition: 'The Kubernetes API Server (kube-apiserver) validates and configures data for pods, services, and other objects. It serves the REST API and acts as the primary management hub for the cluster.',
    keyFact: 'All communications between cluster components pass through the API Server. No component talks directly to etcd except kube-apiserver.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver',
  },
  {
    id: 'etcd',
    title: 'What is etcd?',
    definition: 'etcd is a consistent and highly-available key-value store used as Kubernetes backing store for all cluster data.',
    keyFact: 'etcd uses the Raft consensus algorithm to maintain strong consistency across distributed cluster master nodes.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#etcd',
  },
  {
    id: 'scheduler',
    title: 'What is the Scheduler?',
    definition: 'The Kubernetes Scheduler (kube-scheduler) watches for newly created Pods that have no assigned node and selects a healthy worker node for them to run on.',
    keyFact: 'Scheduling decisions consider individual and collective resource requirements, hardware constraints, affinity specifications, and data locality.',
    docsUrl: 'https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/',
  },
  {
    id: 'controller-manager',
    title: 'What is the Controller Manager?',
    definition: 'The Kubernetes Controller Manager runs controller loops that regulate cluster state toward the desired state defined in manifests.',
    keyFact: 'It combines the Node Lifecycle Controller, ReplicaSet Controller, EndpointSlice Controller, and ServiceAccount Controller into a single binary.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kube-controller-manager',
  },
  {
    id: 'kubelet',
    title: 'What is a Kubelet?',
    definition: 'The Kubelet is an agent that runs on each worker node in the cluster. It ensures that containers described in PodSpecs are running and healthy.',
    keyFact: 'The Kubelet does not manage containers that were not created by Kubernetes, and communicates with runtimes via the Container Runtime Interface (CRI).',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kubelet',
  },
  {
    id: 'kube-proxy',
    title: 'What is kube-proxy?',
    definition: 'kube-proxy is a network proxy that runs on each node in your cluster, maintaining network rules on nodes that allow network communication to Pods.',
    keyFact: 'kube-proxy configures OS packet filtering backends (iptables, IPVS, or nftables) to forward traffic destined for Service ClusterIPs.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kube-proxy',
  },
  {
    id: 'container-runtime',
    title: 'What is a Container Runtime?',
    definition: 'The container runtime is the underlying software responsible for pulling container images and running containers on a host.',
    keyFact: 'Kubernetes supports CRI-compliant runtimes including containerd and CRI-O.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#container-runtime',
  },
  {
    id: 'pod',
    title: 'What is a Pod?',
    definition: 'A Pod is the smallest execution unit in Kubernetes, encapsulating one or more containers that share storage, network IP address, and runtime options.',
    keyFact: 'Containers in the same Pod share the same Linux network namespace, meaning they communicate over localhost and share port space.',
    docsUrl: 'https://kubernetes.io/docs/concepts/workloads/pods/',
  },
  {
    id: 'namespace',
    title: 'What is a Namespace?',
    definition: 'Namespaces provide a mechanism for isolating groups of resources within a single Kubernetes cluster.',
    keyFact: 'Resource names must be unique within a namespace, but can repeat across different namespaces.',
    docsUrl: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
  },
];
