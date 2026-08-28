import { K8sResource, LifecycleStep } from '../model/types.ts';
import { createPodLifecycleSteps } from './pod-lifecycle.ts';
import { createDeploymentLifecycleSteps } from './deployment-lifecycle.ts';
import { DeploymentResource } from '../parser/resource-types.ts';

export function getLifecycleStepsForResources(resources: K8sResource[]): LifecycleStep[] {
  if (!resources || resources.length === 0) {
    return createPodLifecycleSteps('nginx-pod');
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
    default:
      return createPodLifecycleSteps('nginx-pod');
  }
}
