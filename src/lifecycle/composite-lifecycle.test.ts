import { describe, it, expect } from 'vitest';
import { createCompositeLifecycleSteps } from './composite-lifecycle.ts';

describe('composite-lifecycle', () => {
  it('generates 12 sequential full-stack steps', () => {
    const steps = createCompositeLifecycleSteps(4, 'web-deploy', 'web-svc', 'web-ing');
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

  it('sequences config mounting before pod start and service discovery after pod start', () => {
    const steps = createCompositeLifecycleSteps(4, 'auth-deploy', 'auth-svc', 'auth-ing');

    // Step 3: ConfigMap / Secret catalog registration
    expect(steps[2].title).toContain('Configuration and Secrets');

    // Step 7: Kubelet mounts configuration
    expect(steps[6].title).toContain('mount configuration');

    // Step 9: Service matches pod labels
    expect(steps[8].title).toContain('Service matches');

    // Step 11: Ingress routes
    expect(steps[10].title).toContain('Ingress Controller');
  });

  it('handles 2-resource configuration cleanly', () => {
    const steps = createCompositeLifecycleSteps(2, 'db-deploy', 'db-svc', 'db-ing');
    expect(steps).toHaveLength(12);
    expect(steps[0].what).toContain('2 interrelated Kubernetes resources');
  });

  it('verifies final client traffic step 12 completes successfully', () => {
    const steps = createCompositeLifecycleSteps(3, 'shop-deploy', 'shop-svc', 'shop-ing');
    const step12 = steps[11];
    expect(step12.title).toContain('Full-stack application');
    expect(step12.nodeStatusUpdates?.['node-pod-shop-deploy-1']).toBe('success');
  });
});
