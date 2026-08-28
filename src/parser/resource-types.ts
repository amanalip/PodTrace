import { K8sResource, K8sResourceMetadata } from '../model/types.ts';

export interface ContainerPort {
  name?: string;
  containerPort: number;
  protocol?: string;
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly?: boolean;
}

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: {
    configMapKeyRef?: { name: string; key: string };
    secretKeyRef?: { name: string; key: string };
  };
}

export interface ContainerSpec {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports?: ContainerPort[];
  env?: EnvVar[];
  volumeMounts?: VolumeMount[];
  resources?: {
    requests?: { cpu?: string; memory?: string };
    limits?: { cpu?: string; memory?: string };
  };
}

export interface VolumeSpec {
  name: string;
  emptyDir?: Record<string, unknown>;
  configMap?: { name: string };
  secret?: { secretName: string };
  persistentVolumeClaim?: { claimName: string };
  hostPath?: { path: string };
}

export interface PodResource extends K8sResource {
  kind: 'Pod';
  spec: {
    containers: ContainerSpec[];
    initContainers?: ContainerSpec[];
    volumes?: VolumeSpec[];
    restartPolicy?: 'Always' | 'OnFailure' | 'Never';
    nodeSelector?: Record<string, string>;
  };
}

export interface DeploymentResource extends K8sResource {
  kind: 'Deployment';
  spec: {
    replicas?: number;
    selector: {
      matchLabels?: Record<string, string>;
    };
    template: {
      metadata?: Partial<K8sResourceMetadata>;
      spec: {
        containers: ContainerSpec[];
        volumes?: VolumeSpec[];
      };
    };
    strategy?: {
      type?: 'RollingUpdate' | 'Recreate';
      rollingUpdate?: {
        maxSurge?: number | string;
        maxUnavailable?: number | string;
      };
    };
  };
}

export interface ServicePort {
  name?: string;
  protocol?: string;
  port: number;
  targetPort?: number | string;
  nodePort?: number;
}

export interface ServiceResource extends K8sResource {
  kind: 'Service';
  spec: {
    type?: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
    selector?: Record<string, string>;
    ports: ServicePort[];
    clusterIP?: string;
  };
}

export interface IngressPath {
  path: string;
  pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
  backend: {
    service?: {
      name: string;
      port?: { number?: number; name?: string };
    };
  };
}

export interface IngressRule {
  host?: string;
  http?: {
    paths: IngressPath[];
  };
}

export interface IngressTLS {
  hosts?: string[];
  secretName?: string;
}

export interface IngressResource extends K8sResource {
  kind: 'Ingress';
  spec: {
    ingressClassName?: string;
    tls?: IngressTLS[];
    rules?: IngressRule[];
  };
}

export interface ConfigMapResource extends K8sResource {
  kind: 'ConfigMap';
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
}

export interface SecretResource extends K8sResource {
  kind: 'Secret';
  type?: string;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
}

export interface PVCResource extends K8sResource {
  kind: 'PersistentVolumeClaim';
  spec: {
    accessModes: string[];
    resources?: {
      requests?: { storage?: string };
    };
    storageClassName?: string;
    volumeName?: string;
  };
}

export type PersistentVolumeClaimResource = PVCResource;

export interface PVResource extends K8sResource {
  kind: 'PersistentVolume';
  spec: {
    capacity: { storage: string };
    accessModes: string[];
    storageClassName?: string;
    hostPath?: { path: string };
    claimRef?: { name: string; namespace?: string };
  };
}

export interface HPAResource extends K8sResource {
  kind: 'HorizontalPodAutoscaler';
  spec: {
    scaleTargetRef: {
      apiVersion?: string;
      kind: string;
      name: string;
    };
    minReplicas?: number;
    maxReplicas: number;
    metrics?: Array<{
      type: string;
      resource?: {
        name: string;
        target: {
          type: string;
          averageUtilization?: number;
          averageValue?: string;
        };
      };
    }>;
  };
}

export interface StatefulSetResource extends K8sResource {
  kind: 'StatefulSet';
  spec: {
    serviceName: string;
    replicas?: number;
    selector: {
      matchLabels?: Record<string, string>;
    };
    template: {
      metadata?: K8sResourceMetadata;
      spec: {
        containers: ContainerSpec[];
      };
    };
  };
}

export interface DaemonSetResource extends K8sResource {
  kind: 'DaemonSet';
  spec: {
    selector: {
      matchLabels?: Record<string, string>;
    };
    template: {
      metadata?: K8sResourceMetadata;
      spec: {
        containers: ContainerSpec[];
      };
    };
  };
}

export interface JobResource extends K8sResource {
  kind: 'Job';
  spec: {
    completions?: number;
    parallelism?: number;
    backoffLimit?: number;
    template: {
      spec: {
        containers: ContainerSpec[];
        restartPolicy?: 'OnFailure' | 'Never';
      };
    };
  };
}

export interface CronJobResource extends K8sResource {
  kind: 'CronJob';
  spec: {
    schedule: string;
    jobTemplate: {
      spec: {
        template: {
          spec: {
            containers: ContainerSpec[];
          };
        };
      };
    };
  };
}

export interface NetworkPolicyResource extends K8sResource {
  kind: 'NetworkPolicy';
  spec: {
    podSelector: {
      matchLabels?: Record<string, string>;
    };
    policyTypes?: Array<'Ingress' | 'Egress'>;
    ingress?: Array<Record<string, unknown>>;
    egress?: Array<Record<string, unknown>>;
  };
}
