import { K8sResource, LifecycleStep } from '../model/types.ts';
import { createPodLifecycleSteps } from './pod-lifecycle.ts';
import { createDeploymentLifecycleSteps } from './deployment-lifecycle.ts';
import { createServiceLifecycleSteps } from './service-lifecycle.ts';
import { createIngressLifecycleSteps } from './ingress-lifecycle.ts';
import { createConfigLifecycleSteps } from './config-lifecycle.ts';
import { createCompositeLifecycleSteps } from './composite-lifecycle.ts';
import { DeploymentResource, ServiceResource, IngressResource } from '../parser/resource-types.ts';

export function getLifecycleStepsForResources(resources: K8sResource[]): LifecycleStep[] {
  if (!resources || resources.length === 0) {
    return createPodLifecycleSteps('nginx-pod');
  }

  if (resources.length > 1) {
    const deployment = resources.find((r) => r.kind === 'Deployment');
    const service = resources.find((r) => r.kind === 'Service');
    const ingress = resources.find((r) => r.kind === 'Ingress');
    const depName = deployment?.metadata?.name || 'app-deployment';
    const svcName = service?.metadata?.name || `${depName}-service`;
    const ingName = ingress?.metadata?.name || `${depName}-ingress`;
    return createCompositeLifecycleSteps(resources.length, depName, svcName, ingName);
  }

  const primaryResource = resources[0];

  switch (primaryResource.kind) {
    case 'Pod': {
      const podName = primaryResource.metadata?.name || 'pod';
      return createPodLifecycleSteps(podName);
    }
    case 'Deployment': {
      const dep = primaryResource as DeploymentResource;
      const deploymentName = dep.metadata?.name || 'deployment';
      const replicas = dep.spec?.replicas ?? 3;
      return createDeploymentLifecycleSteps(deploymentName, replicas);
    }
    case 'Service': {
      const svc = primaryResource as ServiceResource;
      const serviceName = svc.metadata?.name || 'service';
      const serviceType = svc.spec?.type || 'ClusterIP';
      const clusterIP = svc.spec?.clusterIP || '10.96.0.42';
      return createServiceLifecycleSteps(serviceName, serviceType, clusterIP);
    }
    case 'Ingress': {
      const ing = primaryResource as IngressResource;
      const ingressName = ing.metadata?.name || 'ingress';
      const rules = ing.spec?.rules || [];
      const firstRule = rules[0];
      const host = firstRule?.host || 'app.example.com';
      const firstPath = firstRule?.http?.paths?.[0];
      const path = firstPath?.path || '/';
      const serviceName =
        firstPath?.backend?.service?.name ||
        ing.spec?.defaultBackend?.service?.name ||
        `${ingressName}-service`;
      return createIngressLifecycleSteps(ingressName, host, path, serviceName);
    }
    case 'ConfigMap':
    case 'Secret':
    case 'PersistentVolumeClaim': {
      const name = primaryResource.metadata?.name || 'config';
      return createConfigLifecycleSteps(primaryResource.kind, name);
    }
    default:
      return createPodLifecycleSteps('nginx-pod');
  }
}
