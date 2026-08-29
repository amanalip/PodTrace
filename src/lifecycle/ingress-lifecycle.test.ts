import { describe, it, expect } from 'vitest';
import { createIngressLifecycleSteps } from './ingress-lifecycle.ts';

describe('ingress-lifecycle', () => {
  it('generates 11 sequential steps', () => {
    const steps = createIngressLifecycleSteps('api-ing', 'api.test.com', '/auth', 'auth-svc');
    expect(steps).toHaveLength(11);

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

  it('includes Ingress Controller reload, reverse proxying, and response round-trip', () => {
    const steps = createIngressLifecycleSteps('app-ing', 'app.io', '/', 'app-svc');

    // Step 5: Reload config
    expect(steps[4].edgeLabel).toContain('proxy upstream configured');

    // Step 6: Client request
    expect(steps[5].edgeId).toBe('edge-client-ic-request');

    // Step 9: Ingress controller proxies directly to Pod
    expect(steps[8].edgeId).toBe('edge-ic-proxy-pod');
    expect(steps[8].why).toContain('Direct pod routing');

    // Step 11: Response returned to client
    expect(steps[10].edgeId).toBe('edge-ic-client-response');
    expect(steps[10].nodeStatusUpdates?.['node-external-client']).toBe('success');
  });

  it('correctly maps host in client request step', () => {
    const steps = createIngressLifecycleSteps('custom-ing', 'api.company.com', '/v2/users', 'users-svc');
    const step6 = steps[5];
    expect(step6.what).toContain('api.company.com');
  });

  it('correctly targets the backend service in step 8', () => {
    const steps = createIngressLifecycleSteps('pay-ing', 'pay.company.com', '/checkout', 'checkout-svc');
    const step8 = steps[7];
    expect(step8.what).toContain('checkout-svc');
  });
});
