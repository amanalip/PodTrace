import { describe, it, expect } from 'vitest';
import { createDeploymentLifecycleSteps } from './deployment-lifecycle.ts';

describe('deployment-lifecycle', () => {
  it('generates 12 sequential steps', () => {
    const steps = createDeploymentLifecycleSteps('api-deployment', 3);
    expect(steps).toHaveLength(12);

    steps.forEach((step, idx) => {
      expect(step.stepNumber).toBe(idx + 1);
      expect(step.title).toBeTruthy();
      expect(step.what).toBeTruthy();
      expect(step.why).toBeTruthy();
      expect(step.componentName).toBeTruthy();
      expect(step.sourceNodeId).toBeTruthy();
      expect(step.targetNodeId).toBeTruthy();
      expect(step.edgeId).toBeTruthy();
    });
  });

  it('includes ReplicaSet and Deployment controller stages', () => {
    const steps = createDeploymentLifecycleSteps('api-deployment', 3);

    // Step 3: Deployment Controller watch
    expect(steps[2].componentName).toBe('kube-controller-manager');

    // Step 4: Create ReplicaSet
    expect(steps[3].edgeId).toBe('edge-cm-create-rs');

    // Step 6: ReplicaSet Controller creates Pods
    expect(steps[5].edgeId).toBe('edge-cm-create-pods');

    // Step 12: Deployment ready
    expect(steps[11].nodeStatusUpdates?.['node-pod-api-deployment-1']).toBe('success');
    expect(steps[11].nodeStatusUpdates?.['node-pod-api-deployment-2']).toBe('success');
    expect(steps[11].nodeStatusUpdates?.['node-pod-api-deployment-3']).toBe('success');
  });
});
