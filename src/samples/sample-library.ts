export interface SampleManifest {
  id: string;
  name: string;
  category: 'Basics' | 'Workloads' | 'Networking' | 'Config' | 'Scaling' | 'Full stack';
  description: string;
  yaml: string;
}

export const SAMPLE_LIBRARY: SampleManifest[] = [
  // Basics
  {
    id: 'simple-pod',
    name: 'Simple Pod',
    category: 'Basics',
    description: 'Single container running an nginx web server.',
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
`,
  },
  {
    id: 'multi-container-pod',
    name: 'Multi-Container Pod',
    category: 'Basics',
    description: 'Primary web app with a logging sidecar container sharing volume and network.',
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: web-with-sidecar
  labels:
    app: web-service
spec:
  volumes:
    - name: shared-logs
      emptyDir: {}
  containers:
    - name: app
      image: node:20-alpine
      ports:
        - containerPort: 3000
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
    - name: log-collector
      image: fluent/fluent-bit:2.2
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
`,
  },
  {
    id: 'init-container-pod',
    name: 'Pod with Init Container',
    category: 'Basics',
    description: 'Init container prepares database schema before application container boots.',
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
  labels:
    app: backend
spec:
  initContainers:
    - name: init-db
      image: busybox:1.36
      command: ['sh', '-c', 'echo Database ready; sleep 2']
  containers:
    - name: app-server
      image: python:3.11-slim
      ports:
        - containerPort: 8000
`,
  },

  // Workloads
  {
    id: 'deployment',
    name: 'Deployment',
    category: 'Workloads',
    description: 'Deployment managing 3 replicas with a rolling update strategy.',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  labels:
    app: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80
`,
  },
  {
    id: 'statefulset',
    name: 'StatefulSet',
    category: 'Workloads',
    description: 'Ordered stateful workload with stable hostnames and storage.',
    yaml: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  serviceName: redis-service
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7.2
          ports:
            - containerPort: 6379
`,
  },
  {
    id: 'daemonset',
    name: 'DaemonSet',
    category: 'Workloads',
    description: 'Runs exactly one copy of a node monitoring agent on every worker node.',
    yaml: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.7.0
          ports:
            - containerPort: 9100
`,
  },
  {
    id: 'job',
    name: 'Job',
    category: 'Workloads',
    description: 'Batch process running to completion with backoff limit.',
    yaml: `apiVersion: batch/v1
kind: Job
metadata:
  name: batch-report-job
spec:
  completions: 1
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: report-worker
          image: python:3.11-slim
          command: ['python', '-c', 'print("Batch process complete")']
`,
  },
  {
    id: 'cronjob',
    name: 'CronJob',
    category: 'Workloads',
    description: 'Runs a scheduled task every 5 minutes.',
    yaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: periodic-cleanup
spec:
  schedule: "*/5 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cleaner
              image: busybox:1.36
              command: ['sh', '-c', 'echo Cleanup completed']
`,
  },

  // Networking
  {
    id: 'clusterip-service',
    name: 'ClusterIP Service',
    category: 'Networking',
    description: 'Internal load-balanced VIP routing to matching pods.',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
`,
  },
  {
    id: 'nodeport-service',
    name: 'NodePort Service',
    category: 'Networking',
    description: 'Exposes the service on each node IP at a static port.',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: frontend-nodeport
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
`,
  },
  {
    id: 'loadbalancer-service',
    name: 'LoadBalancer Service',
    category: 'Networking',
    description: 'Provisions an external cloud load balancer pointing to nodes.',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: api-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
    - port: 443
      targetPort: 8443
`,
  },
  {
    id: 'ingress',
    name: 'Ingress',
    category: 'Networking',
    description: 'HTTP/HTTPS routing rules mapping hostnames and paths to services.',
    yaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
`,
  },

  // Config
  {
    id: 'configmap',
    name: 'ConfigMap',
    category: 'Config',
    description: 'Stores non-confidential configuration key-value pairs.',
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  LOG_LEVEL: info
  DATABASE_HOST: postgres.default.svc.cluster.local
`,
  },
  {
    id: 'secret',
    name: 'Secret',
    category: 'Config',
    description: 'Stores sensitive data such as API keys and passwords.',
    yaml: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjcmV0cGFzc3dvcmQ=
`,
  },
  {
    id: 'pvc-pv',
    name: 'PVC + PV Storage',
    category: 'Config',
    description: 'PersistentVolumeClaim requesting storage bound to a PersistentVolume.',
    yaml: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: task-pv-volume
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-pv-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
`,
  },

  // Scaling
  {
    id: 'deployment-hpa',
    name: 'Deployment + HPA',
    category: 'Scaling',
    description: 'HorizontalPodAutoscaler scaling deployment based on average CPU target.',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: autoscale-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: autoscale-app
  template:
    metadata:
      labels:
        app: autoscale-app
    spec:
      containers:
        - name: app
          image: registry.k8s.io/hpa-example
          resources:
            requests:
              cpu: 200m
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: autoscale-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: autoscale-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
`,
  },

  // Full stack
  {
    id: 'full-stack',
    name: 'Full Stack Application',
    category: 'Full stack',
    description: 'Complete multi-document stack with Ingress, Service, Deployment, and ConfigMap.',
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: webapp-config
data:
  APP_MODE: production
  API_URL: /api/v1
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
  labels:
    app: webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
        - name: webapp
          image: nginx:1.25
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: ClusterIP
  selector:
    app: webapp
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-service
                port:
                  number: 80
`,
  },
];
