import { K8sResource, LifecycleStep } from '../model/types.ts';
import { createPodLifecycleSteps } from './pod-lifecycle.ts';

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
    default:
      return createPodLifecycleSteps('nginx-pod');
  }
}
