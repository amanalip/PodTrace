import { describe, it, expect } from 'vitest';
import { createDeploymentLifecycleSteps } from './deployment-lifecycle.ts';

describe('deployment-lifecycle', () => {
  it('generates 12 sequential steps with valid metadata', () => {
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
      expect(step.docsUrl).toMatch(/^https:\/\/kubernetes\.io\/docs\//);
      expect(step.durationMs).toBe(2000);
    });
  });

  it('uses default parameters when called with no arguments', () => {
    const steps = createDeploymentLifecycleSteps();
    expect(steps).toHaveLength(12);
    expect(steps[0].edgeLabel).toBe('kubectl apply -f frontend-deployment.yaml');
    expect(steps[11].nodeStatusUpdates?.['node-pod-frontend-deployment-1']).toBe('success');
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

  it('handles single replica deployment configuration', () => {
    const steps = createDeploymentLifecycleSteps('single-deploy', 1);
    expect(steps).toHaveLength(12);
    expect(steps[11].nodeStatusUpdates?.['node-pod-single-deploy-1']).toBe('success');
  });

  it('verifies scheduler step in deployment lifecycle', () => {
    const steps = createDeploymentLifecycleSteps('multi-deploy', 2);
    expect(steps[7].componentName).toBe('kube-scheduler');
    expect(steps[7].title).toContain('Scheduler evaluates candidate worker');
  });

  it('verifies kubelet step 10 on worker nodes detects pod assignments', () => {
    const steps = createDeploymentLifecycleSteps('worker-deploy', 2);
    const step10 = steps[9];
    expect(step10.componentName).toBe('kubelet');
    expect(step10.title).toContain('Node Kubelets detect assigned Pods');
    expect(step10.nodeStatusUpdates?.['node-kubelet-1']).toBe('active');
  });

  it('verifies step 11 container runtime launch on worker nodes', () => {
    const steps = createDeploymentLifecycleSteps('runtime-deploy', 2);
    const step11 = steps[10];
    expect(step11.componentName).toBe('Container Runtime');
    expect(step11.title).toContain('Container Runtimes pull images');
  });

  it('transitions edges between active and complete across steps', () => {
    const steps = createDeploymentLifecycleSteps('edge-deploy', 2);

    expect(steps[0].edgeStatusUpdates?.['edge-user-kubectl']).toBe('active');
    expect(steps[1].edgeStatusUpdates?.['edge-user-kubectl']).toBe('complete');
    expect(steps[1].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('active');
  });
});
