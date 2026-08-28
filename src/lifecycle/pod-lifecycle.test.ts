import { describe, it, expect } from 'vitest';
import { createPodLifecycleSteps } from './pod-lifecycle.ts';

describe('pod-lifecycle', () => {
  it('generates exactly 9 sequential steps', () => {
    const steps = createPodLifecycleSteps('redis-pod');
    expect(steps).toHaveLength(9);

    steps.forEach((step, idx) => {
      expect(step.stepNumber).toBe(idx + 1);
      expect(step.title).toBeTruthy();
      expect(step.what).toBeTruthy();
      expect(step.why).toBeTruthy();
      expect(step.componentName).toBeTruthy();
      expect(step.componentRole).toBeTruthy();
      expect(step.docsUrl).toBeTruthy();
      expect(step.sourceNodeId).toBeTruthy();
      expect(step.targetNodeId).toBeTruthy();
      expect(step.edgeId).toBeTruthy();
    });
  });

  it('references the target pod node correctly across steps', () => {
    const steps = createPodLifecycleSteps('payment-pod');
    const step8 = steps[7];
    const step9 = steps[8];

    expect(step8.targetNodeId).toBe('node-pod-payment-pod');
    expect(step9.targetNodeId).toBe('node-pod-payment-pod');
    expect(step8.nodeStatusUpdates?.['node-pod-payment-pod']).toBe('success');
  });

  it('updates edge and node statuses accurately through the lifecycle', () => {
    const steps = createPodLifecycleSteps('web-pod');

    // Step 1: user -> kubectl
    expect(steps[0].edgeStatusUpdates?.['edge-user-kubectl']).toBe('active');
    expect(steps[0].nodeStatusUpdates?.['node-user']).toBe('success');
    expect(steps[0].nodeStatusUpdates?.['node-kubectl']).toBe('active');

    // Step 2: kubectl -> apiserver
    expect(steps[1].edgeStatusUpdates?.['edge-user-kubectl']).toBe('complete');
    expect(steps[1].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('active');

    // Step 3: apiserver -> etcd
    expect(steps[2].edgeStatusUpdates?.['edge-apiserver-etcd']).toBe('active');

    // Step 6: apiserver -> kubelet
    expect(steps[5].nodeStatusUpdates?.['node-kubelet']).toBe('active');

    // Step 8: runtime -> pod (Running)
    expect(steps[7].nodeStatusUpdates?.['node-pod-web-pod']).toBe('success');
  });
});
