import { Scenario } from './scenario-types.ts';

export const SCENARIO_CATALOG: Scenario[] = [
  // 1. Pod Lifecycle
  {
    id: 'crashloopbackoff',
    title: 'CrashLoopBackOff on Startup',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'The container process exits immediately with code 1 upon startup.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: crashing-app
  namespace: default
spec:
  containers:
  - name: web
    image: busybox:latest
    command: ["sh", "-c", "echo Starting server... && exit 1"]`,
    failureStep: 9,
    failureDetails: {
      errorType: 'CrashLoopBackOff',
      failingStep: 9,
      failingNodeId: 'node-pod',
      failingEdgeId: 'edge-runtime-pod',
      logs: [
        { timestamp: '00:00:01', level: 'info', component: 'web', message: 'Starting server...' },
        { timestamp: '00:00:02', level: 'error', component: 'web', message: 'Process exited with status 1' },
      ],
      events: [
        { type: 'Normal', reason: 'Pulled', message: 'Successfully pulled image "busybox:latest"', from: 'kubelet', age: '10s' },
        { type: 'Normal', reason: 'Created', message: 'Created container web', from: 'kubelet', age: '9s' },
        { type: 'Warning', reason: 'BackOff', message: 'Back-off restarting failed container web in pod crashing-app', from: 'kubelet', age: '2s' },
      ],
      fixHint: 'Remove "exit 1" from the command or run a persistent process such as "sleep 3600".',
    },
    successMessage: 'Container started and is running stably!',
    explanation: 'CrashLoopBackOff means the application process crashed after starting. Kubelet restarts it with exponential backoff delay.',
    validator: (yaml) => {
      if (!yaml.includes('exit 1') && (yaml.includes('sleep') || !yaml.includes('command:'))) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Ensure the container command does not terminate with exit 1.' };
    },
  },
  {
    id: 'imagepullbackoff',
    title: 'ImagePullBackOff (Invalid Tag)',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'The container runtime cannot find the requested image tag in the container registry.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: web-frontend
  namespace: default
spec:
  containers:
  - name: nginx
    image: nginx:999.0.0
    ports:
    - containerPort: 80`,
    failureStep: 8,
    failureDetails: {
      errorType: 'ImagePullBackOff',
      failingStep: 8,
      failingNodeId: 'node-runtime',
      failingEdgeId: 'edge-kubelet-runtime',
      logs: [],
      events: [
        { type: 'Normal', reason: 'Pulling', message: 'Pulling image "nginx:999.0.0"', from: 'kubelet', age: '30s' },
        { type: 'Warning', reason: 'Failed', message: 'Failed to pull image "nginx:999.0.0": rpc error: not found', from: 'kubelet', age: '25s' },
        { type: 'Warning', reason: 'Failed', message: 'Error: ErrImagePull', from: 'kubelet', age: '20s' },
        { type: 'Warning', reason: 'BackOff', message: 'Back-off pulling image "nginx:999.0.0"', from: 'kubelet', age: '5s' },
      ],
      fixHint: 'Change the image tag to a valid version such as "nginx:1.27" or "nginx:alpine".',
    },
    successMessage: 'Image pulled and container created successfully!',
    explanation: 'ImagePullBackOff occurs when Kubelet fails to download the container image due to invalid tags, wrong image names, or missing registry credentials.',
    validator: (yaml) => {
      if (
        yaml.includes('nginx:latest') ||
        yaml.includes('nginx:alpine') ||
        yaml.includes('nginx:1.27') ||
        yaml.includes('nginx:1.')
      ) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Update image to a valid tag like nginx:alpine or nginx:1.27.' };
    },
  },
  {
    id: 'oomkilled',
    title: 'OOMKilled (Out Of Memory)',
    category: 'pod-lifecycle',
    difficulty: 'Intermediate',
    description: 'The Linux kernel OOM killer terminates the container when memory usage exceeds the configured limit.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: memory-intensive-app
  namespace: default
spec:
  containers:
  - name: worker
    image: redis:7-alpine
    resources:
      limits:
        memory: "10Mi"
      requests:
        memory: "10Mi"`,
    failureStep: 9,
    failureDetails: {
      errorType: 'OOMKilled',
      failingStep: 9,
      failingNodeId: 'node-pod',
      failingEdgeId: 'edge-runtime-pod',
      logs: [
        { timestamp: '00:00:01', level: 'info', component: 'worker', message: 'Server initialized' },
        { timestamp: '00:00:03', level: 'error', component: 'kernel', message: 'Memory cgroup out of memory: Killed process 1024 (redis-server)' },
      ],
      events: [
        { type: 'Warning', reason: 'OOMKilled', message: 'Container worker exceeded memory limit (10Mi) and was killed by cgroup manager', from: 'kubelet', age: '4s' },
      ],
      fixHint: 'Increase memory limits and requests to at least "128Mi" or "256Mi".',
    },
    successMessage: 'Pod allocated sufficient memory and is stable!',
    explanation: 'When a container attempts to allocate more RAM than its memory limit allows, the kernel cgroup manager terminates it with exit code 137 (OOMKilled).',
    validator: (yaml) => {
      if (
        yaml.includes('128Mi') ||
        yaml.includes('256Mi') ||
        yaml.includes('512Mi') ||
        yaml.includes('1Gi')
      ) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Increase the memory limit to 128Mi or higher.' };
    },
  },

  // 2. Scheduling
  {
    id: 'unschedulable-cpu',
    title: 'Pending: Insufficient CPU',
    category: 'scheduling',
    difficulty: 'Beginner',
    description: 'The pod requests more CPU cores than any individual worker node can provide.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: large-batch-job
  namespace: default
spec:
  containers:
  - name: compute
    image: busybox:latest
    command: ["sleep", "3600"]
    resources:
      requests:
        cpu: "64"`,
    failureStep: 6,
    failureDetails: {
      errorType: 'FailedScheduling',
      failingStep: 6,
      failingNodeId: 'node-scheduler',
      failingEdgeId: 'edge-scheduler-apiserver',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedScheduling', message: '0/2 nodes are available: 2 Insufficient cpu.', from: 'default-scheduler', age: '15s' },
      ],
      fixHint: 'Reduce the requested CPU value to "500m" or "1".',
    },
    successMessage: 'Scheduler found an eligible node with sufficient CPU capacity!',
    explanation: 'The kube-scheduler filters out nodes that cannot satisfy the sum of existing container requests plus the new pod request.',
    validator: (yaml) => {
      if (
        yaml.includes('500m') ||
        yaml.includes('250m') ||
        yaml.includes('100m') ||
        yaml.includes('cpu: "1"') ||
        yaml.includes('cpu: "2"')
      ) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Reduce CPU request to 500m or 1.' };
    },
  },
  {
    id: 'nodeselector-mismatch',
    title: 'Pending: nodeSelector Mismatch',
    category: 'scheduling',
    difficulty: 'Beginner',
    description: 'The pod specifies nodeSelector labels that do not match any existing node in the cluster.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: gpu-processor
  namespace: default
spec:
  nodeSelector:
    accelerator: nvidia-h100-gpu
  containers:
  - name: worker
    image: nginx:alpine`,
    failureStep: 6,
    failureDetails: {
      errorType: 'FailedScheduling',
      failingStep: 6,
      failingNodeId: 'node-scheduler',
      failingEdgeId: 'edge-scheduler-apiserver',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedScheduling', message: '0/2 nodes are available: 2 node(s) didn\'t match Pod\'s node affinity/selector.', from: 'default-scheduler', age: '20s' },
      ],
      fixHint: 'Remove the restrictive nodeSelector or change it to an existing label like "kubernetes.io/os: linux".',
    },
    successMessage: 'Pod scheduled successfully onto a matching node!',
    explanation: 'nodeSelector requires strict exact matches against node labels. If zero nodes have all requested key-value pairs, the pod stays Pending.',
    validator: (yaml) => {
      if (!yaml.includes('nvidia-h100-gpu')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Remove or update the accelerator: nvidia-h100-gpu selector.' };
    },
  },
  {
    id: 'taint-toleration',
    title: 'Pending: Node Taint Not Tolerated',
    category: 'scheduling',
    difficulty: 'Intermediate',
    description: 'Worker nodes are tainted with "dedicated=special:NoSchedule" but the Pod lacks a matching toleration.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: special-workload
  namespace: default
spec:
  containers:
  - name: app
    image: nginx:alpine`,
    failureStep: 6,
    failureDetails: {
      errorType: 'FailedScheduling',
      failingStep: 6,
      failingNodeId: 'node-scheduler',
      failingEdgeId: 'edge-scheduler-apiserver',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedScheduling', message: '0/2 nodes are available: 2 node(s) had untolerated taint {dedicated: special}.', from: 'default-scheduler', age: '18s' },
      ],
      fixHint: 'Add a toleration for key "dedicated", operator "Equal", value "special", and effect "NoSchedule".',
    },
    successMessage: 'Toleration accepted: Pod scheduled onto dedicated node!',
    explanation: 'Taints allow a node to repel a set of pods. Tolerations allow (but do not force) pods to schedule onto nodes with matching taints.',
    validator: (yaml) => {
      if (yaml.includes('tolerations:') && yaml.includes('dedicated')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Add a toleration for the "dedicated" key.' };
    },
  },

  // 3. Networking
  {
    id: 'service-selector-mismatch',
    title: 'Service Selector Label Mismatch',
    category: 'networking',
    difficulty: 'Beginner',
    description: 'The Service selector does not match the labels on the Deployment Pods, resulting in zero endpoints.',
    yamlTemplate: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deploy
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-server
  template:
    metadata:
      labels:
        app: web-server
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: wrong-label
  ports:
  - port: 80
    targetPort: 80`,
    failureStep: 9,
    failureDetails: {
      errorType: 'NoEndpoints',
      failingStep: 9,
      failingNodeId: 'node-service-web-service',
      logs: [],
      events: [
        { type: 'Warning', reason: 'EmptyEndpoints', message: 'No pods matched selector "app=wrong-label". EndpointSlice has 0 targets.', from: 'endpoint-slice-controller', age: '14s' },
      ],
      fixHint: 'Change the Service selector from "app: wrong-label" to "app: web-server".',
    },
    successMessage: 'Service selector matches Deployment Pods! Endpoints populated.',
    explanation: 'EndpointSlice Controller continuously queries the API server for pods whose labels match the Service selector.',
    validator: (yaml) => {
      if (yaml.includes('app: web-server') && !yaml.includes('app: wrong-label')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Ensure Service selector matches "app: web-server".' };
    },
  },
  {
    id: 'port-mismatch',
    title: 'Service targetPort Mismatch',
    category: 'networking',
    difficulty: 'Beginner',
    description: 'Service forwards traffic to targetPort 8080, but the container listens on port 80.',
    yamlTemplate: `apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 8080`,
    failureStep: 10,
    failureDetails: {
      errorType: 'ConnectionRefused',
      failingStep: 10,
      failingNodeId: 'node-kubeproxy-1',
      logs: [],
      events: [
        { type: 'Warning', reason: 'ConnectionRefused', message: 'TCP handshake failed: Connection refused on 10.244.1.15:8080', from: 'kube-proxy', age: '10s' },
      ],
      fixHint: 'Update targetPort to 80 so it matches the web server listening port.',
    },
    successMessage: 'Port alignment complete: Traffic routing established!',
    explanation: 'targetPort defines the port on the container where traffic is directed. port defines the port exposed by the Service ClusterIP.',
    validator: (yaml) => {
      if (yaml.includes('targetPort: 80') && !yaml.includes('targetPort: 8080')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Change targetPort to 80.' };
    },
  },
  {
    id: 'networkpolicy-blocked',
    title: 'NetworkPolicy Ingress Blocked',
    category: 'networking',
    difficulty: 'Advanced',
    description: 'A default-deny NetworkPolicy prevents client connections from reaching the backend pods.',
    yamlTemplate: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-netpol
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
  - Ingress`,
    failureStep: 9,
    failureDetails: {
      errorType: 'NetworkBlocked',
      failingStep: 9,
      failingNodeId: 'node-pod',
      logs: [],
      events: [
        { type: 'Warning', reason: 'PacketDropped', message: 'Ingress packet from 10.244.0.5 dropped by CNI network policy enforcement', from: 'calico-cni', age: '8s' },
      ],
      fixHint: 'Add an ingress rule with an empty selector "{}" or port 80/8080 allow rule under spec.ingress.',
    },
    successMessage: 'NetworkPolicy updated with allowed ingress rules!',
    explanation: 'Specifying Ingress in policyTypes without defining any ingress rule items creates an isolated default-deny policy for matched pods.',
    validator: (yaml) => {
      if (yaml.includes('ingress:') || yaml.includes('from:')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Add an ingress allow rule to the NetworkPolicy.' };
    },
  },

  // 4. Storage & Config
  {
    id: 'configmap-missing-key',
    title: 'CreateContainerConfigError (Missing Key)',
    category: 'storage',
    difficulty: 'Intermediate',
    description: 'The container references a ConfigMap key that does not exist.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: api-gateway
  namespace: default
spec:
  containers:
  - name: gateway
    image: nginx:alpine
    env:
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: NONEXISTENT_DB_KEY`,
    failureStep: 7,
    failureDetails: {
      errorType: 'CreateContainerConfigError',
      failingStep: 7,
      failingNodeId: 'node-kubelet',
      failingEdgeId: 'edge-kubelet-prepare-volume',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedMount', message: 'configmap "app-config" key "NONEXISTENT_DB_KEY" not found', from: 'kubelet', age: '12s' },
      ],
      fixHint: 'Change the key name to "DB_HOST" or set "optional: true" on configMapKeyRef.',
    },
    successMessage: 'Valid key reference configured: Container initialized!',
    explanation: 'If a pod references a missing ConfigMap or key without optional: true, Kubelet refuses to start the container.',
    validator: (yaml) => {
      if (
        yaml.includes('optional: true') ||
        !yaml.includes('NONEXISTENT_DB_KEY')
      ) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Fix the key name or add optional: true.' };
    },
  },
  {
    id: 'pvc-pending',
    title: 'Pending PVC: StorageClass Not Found',
    category: 'storage',
    difficulty: 'Intermediate',
    description: 'The PersistentVolumeClaim requests a storageClassName that does not exist in the cluster.',
    yamlTemplate: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-storage
  namespace: default
spec:
  storageClassName: invalid-ssd-tier
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`,
    failureStep: 6,
    failureDetails: {
      errorType: 'ProvisioningFailed',
      failingStep: 6,
      failingNodeId: 'node-kubelet',
      logs: [],
      events: [
        { type: 'Warning', reason: 'ProvisioningFailed', message: 'storageclass.storage.k8s.io "invalid-ssd-tier" not found', from: 'persistentvolume-controller', age: '22s' },
      ],
      fixHint: 'Change storageClassName to "standard" or "gp3".',
    },
    successMessage: 'PVC bound to provisioned storage volume!',
    explanation: 'Dynamic storage volume provisioning requires a valid StorageClass with an active CSI provisioner plugin.',
    validator: (yaml) => {
      if (
        yaml.includes('storageClassName: standard') ||
        yaml.includes('storageClassName: gp3') ||
        yaml.includes('storageClassName: gp2') ||
        !yaml.includes('invalid-ssd-tier')
      ) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Update storageClassName to standard.' };
    },
  },

  // 5. Security
  {
    id: 'readonly-rootfs',
    title: 'ReadOnlyRootFilesystem Crash',
    category: 'security',
    difficulty: 'Intermediate',
    description: 'The container enforces readOnlyRootFilesystem: true but tries to write temporary log files to /tmp.',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: secure-app
  namespace: default
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "echo log > /tmp/app.log && sleep 3600"]
    securityContext:
      readOnlyRootFilesystem: true`,
    failureStep: 9,
    failureDetails: {
      errorType: 'CrashLoopBackOff',
      failingStep: 9,
      failingNodeId: 'node-pod',
      logs: [
        { timestamp: '00:00:01', level: 'error', component: 'app', message: 'sh: can\'t create /tmp/app.log: Read-only file system' },
      ],
      events: [
        { type: 'Warning', reason: 'BackOff', message: 'Back-off restarting failed container app in pod secure-app', from: 'kubelet', age: '10s' },
      ],
      fixHint: 'Mount a writable emptyDir volume at /tmp or remove readOnlyRootFilesystem.',
    },
    successMessage: 'Writable emptyDir volume mounted for /tmp!',
    explanation: 'Immutable root filesystems improve security but require ephemeral emptyDir volume mounts for application scratch spaces.',
    validator: (yaml) => {
      if (yaml.includes('emptyDir:') || !yaml.includes('readOnlyRootFilesystem: true')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Add an emptyDir volume for /tmp or disable readOnlyRootFilesystem.' };
    },
  },
  {
    id: 'non-root-violation',
    title: 'CreateContainerError (runAsNonRoot Violation)',
    category: 'security',
    difficulty: 'Intermediate',
    description: 'The security context demands runAsNonRoot: true, but the image runs as UID 0 (root).',
    yamlTemplate: `apiVersion: v1
kind: Pod
metadata:
  name: non-root-app
  namespace: default
spec:
  securityContext:
    runAsNonRoot: true
  containers:
  - name: web
    image: nginx:alpine`,
    failureStep: 8,
    failureDetails: {
      errorType: 'CreateContainerError',
      failingStep: 8,
      failingNodeId: 'node-runtime',
      logs: [],
      events: [
        { type: 'Warning', reason: 'Failed', message: 'Error: container has runAsNonRoot and image will run as root (UID 0)', from: 'kubelet', age: '15s' },
      ],
      fixHint: 'Specify a non-zero user ID in the security context, such as "runAsUser: 1000".',
    },
    successMessage: 'Security context satisfies non-root policy with runAsUser: 1000!',
    explanation: 'runAsNonRoot: true verifies that the image metadata specifies a non-root USER or that the pod explicitly defines a non-zero runAsUser UID.',
    validator: (yaml) => {
      if (yaml.includes('runAsUser:') || !yaml.includes('runAsNonRoot: true')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Add runAsUser: 1000 under securityContext.' };
    },
  },

  // 6. Scale & Update
  {
    id: 'deployment-max-unavailable',
    title: 'Deadlocked Rolling Update (maxUnavailable: 0)',
    category: 'scale-update',
    difficulty: 'Advanced',
    description: 'Deployment with replicas: 1, maxUnavailable: 0, and maxSurge: 0 cannot create new pods or terminate old ones.',
    yamlTemplate: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: single-replica-deploy
  namespace: default
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 0
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.27`,
    failureStep: 4,
    failureDetails: {
      errorType: 'RolloutDeadlock',
      failingStep: 4,
      failingNodeId: 'node-controllermanager',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedRollout', message: 'Both maxSurge and maxUnavailable cannot be 0 in RollingUpdate strategy', from: 'deployment-controller', age: '30s' },
      ],
      fixHint: 'Set maxSurge to 1 or 25% to allow creating the replacement pod first.',
    },
    successMessage: 'Rolling update strategy unlocked: Rollout proceeding smoothly!',
    explanation: 'When both maxSurge and maxUnavailable are 0, the Deployment controller cannot increase the pod count or decrease it, causing an immediate deadlock.',
    validator: (yaml) => {
      if (!yaml.includes('maxSurge: 0') || yaml.includes('maxSurge: 1') || yaml.includes('maxUnavailable: 1')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Set maxSurge to 1 or remove the 0 values.' };
    },
  },
  {
    id: 'hpa-missing-metrics',
    title: 'HPA Inactive: Missing Resource Requests',
    category: 'scale-update',
    difficulty: 'Intermediate',
    description: 'HorizontalPodAutoscaler cannot calculate target CPU utilization because the target deployment has no CPU requests defined.',
    yamlTemplate: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deploy
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: server
        image: nginx:alpine
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deploy
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`,
    failureStep: 5,
    failureDetails: {
      errorType: 'FailedGetResourceMetric',
      failingStep: 5,
      failingNodeId: 'node-controllermanager',
      logs: [],
      events: [
        { type: 'Warning', reason: 'FailedGetResourceMetric', message: 'missing request for cpu on container server in pod api-deploy', from: 'horizontal-pod-autoscaler', age: '15s' },
      ],
      fixHint: 'Add "resources.requests.cpu: 100m" to the container specification in the Deployment template.',
    },
    successMessage: 'CPU resource request added: HPA is now actively scaling workload!',
    explanation: 'HPA CPU percentage utilization is calculated as (actual CPU usage / requested CPU) * 100. Without a request baseline, the calculation is undefined.',
    validator: (yaml) => {
      if (yaml.includes('requests:') && yaml.includes('cpu:')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Add cpu requests to the deployment container spec.' };
    },
  },
];
