import { LifecycleStep } from '../model/types.ts';

export function createConfigLifecycleSteps(
  kind: 'ConfigMap' | 'Secret' | 'PersistentVolumeClaim' | 'PersistentVolume' = 'ConfigMap',
  name = 'app-config',
): LifecycleStep[] {
  const isSecret = kind === 'Secret';
  const isPVC = kind === 'PersistentVolumeClaim' || kind === 'PersistentVolume';

  const typeDesc = isSecret
    ? 'base64 encoded confidential data'
    : isPVC
      ? 'persistent storage resource definition'
      : 'key-value configuration data';

  return [
    {
      stepNumber: 1,
      title: `kubectl submits ${kind} manifest`,
      sourceNodeId: 'node-user',
      targetNodeId: 'node-kubectl',
      edgeId: 'edge-user-kubectl',
      edgeLabel: `kubectl apply -f ${name}.yaml`,
      what: `The developer applies the ${kind} manifest containing ${typeDesc}. kubectl submits the payload to the API server.`,
      why: `${kind} decouples configuration artifacts and storage requirements from container image binaries.`,
      componentName: 'kubectl',
      componentRole: 'Command-line tool communicating with cluster API.',
      docsUrl: isSecret
        ? 'https://kubernetes.io/docs/concepts/configuration/secret/'
        : isPVC
          ? 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/'
          : 'https://kubernetes.io/docs/concepts/configuration/configmap/',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-user': 'success',
        'node-kubectl': 'active',
        [`node-config-${name}`]: 'idle',
      },
      edgeStatusUpdates: {
        'edge-user-kubectl': 'active',
      },
    },
    {
      stepNumber: 2,
      title: `API Server authenticates and validates ${kind}`,
      sourceNodeId: 'node-kubectl',
      targetNodeId: 'node-apiserver',
      edgeId: 'edge-kubectl-apiserver',
      edgeLabel: `POST /api/v1/namespaces/default/${kind.toLowerCase()}s`,
      what: isSecret
        ? 'Validates base64 data encoding, size limits (1MB maximum per Secret), and authorizes RBAC permissions.'
        : isPVC
          ? 'Validates requested storage capacity, accessModes (e.g. ReadWriteOnce), and storageClassName conformance.'
          : 'Validates key formatting, data size (1MB maximum per ConfigMap), and namespace constraints.',
      why: 'Admission controllers enforce namespace boundaries and cluster quotas before storage.',
      componentName: 'kube-apiserver',
      componentRole: 'Cluster REST gateway and schema validator.',
      docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-kubectl': 'success',
        'node-apiserver': 'active',
        [`node-config-${name}`]: 'idle',
      },
      edgeStatusUpdates: {
        'edge-user-kubectl': 'complete',
        'edge-kubectl-apiserver': 'active',
      },
    },
    {
      stepNumber: 3,
      title: `API Server persists ${kind} in etcd`,
      sourceNodeId: 'node-apiserver',
      targetNodeId: 'node-etcd',
      edgeId: 'edge-apiserver-etcd',
      edgeLabel: `Store ${kind} data in etcd`,
      what: isSecret
        ? 'The Secret is committed to etcd (optionally encrypted at rest using KMS or AES-GCM providers).'
        : `The ${kind} object is committed to etcd under the namespace key hierarchy.`,
      why: 'Guarantees reliable persistence across control plane restarts.',
      componentName: 'etcd',
      componentRole: 'Key-value backing store.',
      docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#etcd',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-apiserver': 'active',
        'node-etcd': 'active',
        [`node-config-${name}`]: 'active',
      },
      edgeStatusUpdates: {
        'edge-kubectl-apiserver': 'complete',
        'edge-apiserver-etcd': 'active',
      },
    },
    {
      stepNumber: 4,
      title: `Register ${kind} in namespace catalog`,
      sourceNodeId: 'node-apiserver',
      targetNodeId: `node-config-${name}`,
      edgeId: 'edge-apiserver-config-obj',
      edgeLabel: `Object Ready: ${kind} in default namespace`,
      what: `The ${kind} is now visible to controllers and pods within the namespace.`,
      why: 'Namespace scoping isolates secrets and configurations from unauthorized workloads.',
      componentName: 'Namespace Catalog',
      componentRole: 'Provides isolated object discovery within the cluster.',
      docsUrl: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-etcd': 'success',
        'node-apiserver': 'active',
        [`node-config-${name}`]: 'success',
      },
      edgeStatusUpdates: {
        'edge-apiserver-etcd': 'complete',
        'edge-apiserver-config-obj': 'active',
      },
    },
    {
      stepNumber: 5,
      title: `Kubelet fetches ${kind} for consumer Pod`,
      sourceNodeId: 'node-kubelet',
      targetNodeId: 'node-apiserver',
      edgeId: 'edge-kubelet-fetch-config',
      edgeLabel: `GET ${kind}/${name}`,
      what: `When scheduling a pod that references ${name}, Kubelet requests the object payload from kube-apiserver.`,
      why: 'Kubelet requires the payload locally on the node before initializing the pod container.',
      componentName: 'kubelet',
      componentRole: 'Node agent synchronizing pod dependencies.',
      docsUrl: 'https://kubernetes.io/docs/concepts/overview/components/#kubelet',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-apiserver': 'success',
        'node-kubelet': 'active',
      },
      edgeStatusUpdates: {
        'edge-apiserver-config-obj': 'complete',
        'edge-kubelet-fetch-config': 'active',
      },
    },
    {
      stepNumber: 6,
      title: 'Kubelet prepares local volume directory / tmpfs',
      sourceNodeId: 'node-kubelet',
      targetNodeId: `node-volume-${name}`,
      edgeId: 'edge-kubelet-prepare-volume',
      edgeLabel: isSecret
        ? 'Mount tmpfs in-memory filesystem (RAM)'
        : isPVC
          ? 'CSI Driver attaches block storage volume'
          : 'Create config directory on node filesystem',
      what: isSecret
        ? 'Kubelet creates an in-memory tmpfs filesystem so decrypted Secret bytes are never written to physical node disk storage.'
        : isPVC
          ? 'The CSI node plugin formats and mounts the attached persistent volume to the node filesystem path.'
          : 'Kubelet creates a local volume directory containing individual files for each key in the ConfigMap.',
      why: isSecret
        ? 'tmpfs prevents sensitive credentials from leaking to disk swap partitions or unencrypted drives.'
        : 'Prepares the host file path prior to container bind-mounting.',
      componentName: 'kubelet Volume Manager',
      componentRole: 'Mounts and configures local filesystems for pods.',
      docsUrl: 'https://kubernetes.io/docs/concepts/storage/volumes/',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-kubelet': 'active',
        [`node-volume-${name}`]: 'active',
      },
      edgeStatusUpdates: {
        'edge-kubelet-fetch-config': 'complete',
        'edge-kubelet-prepare-volume': 'active',
      },
    },
    {
      stepNumber: 7,
      title: 'Kubelet mounts volume and injects environment variables',
      sourceNodeId: `node-volume-${name}`,
      targetNodeId: 'node-pod-consumer',
      edgeId: 'edge-volume-pod-mount',
      edgeLabel: 'Bind-mount into container namespace',
      what: `The prepared volume is bind-mounted into the pod container at the configured mountPath, and environment variables are populated.`,
      why: 'Containers consume configuration transparently as standard files or environment variables without specialized SDK dependencies.',
      componentName: 'Container Runtime Interface',
      componentRole: 'Binds volume paths into the container execution jail.',
      docsUrl: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/',
      durationMs: 2000,
      nodeStatusUpdates: {
        [`node-volume-${name}`]: 'success',
        'node-pod-consumer': 'active',
      },
      edgeStatusUpdates: {
        'edge-kubelet-prepare-volume': 'complete',
        'edge-volume-pod-mount': 'active',
      },
    },
    {
      stepNumber: 8,
      title: 'Pod container executes with injected configuration',
      sourceNodeId: `node-volume-${name}`,
      targetNodeId: 'node-pod-consumer',
      edgeId: 'edge-volume-pod-mount',
      edgeLabel: 'Container running: Config active',
      what: `The application process boots up, reading configuration files and environment variables. The pod enters the Running phase.`,
      why: 'Successfully satisfies the workload startup requirements with externalized configuration.',
      componentName: 'Pod Workload',
      componentRole: 'Application container running with configured parameters.',
      docsUrl: 'https://kubernetes.io/docs/concepts/workloads/pods/',
      durationMs: 2000,
      nodeStatusUpdates: {
        'node-kubelet': 'success',
        'node-pod-consumer': 'success',
      },
      edgeStatusUpdates: {
        'edge-volume-pod-mount': 'complete',
      },
    },
  ];
}
