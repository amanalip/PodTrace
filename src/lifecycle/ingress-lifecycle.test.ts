import { describe, it, expect } from 'vitest';
import { createIngressLifecycleSteps } from './ingress-lifecycle.ts';

describe('ingress-lifecycle', () => {
  it('generates 11 sequential steps with valid metadata', () => {
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
      expect(step.docsUrl).toMatch(/^https:\/\/kubernetes\.io\/docs\//);
      expect(step.durationMs).toBe(2000);
    });
  });

  it('uses default arguments when called with no parameters', () => {
    const steps = createIngressLifecycleSteps();
    expect(steps).toHaveLength(11);
    expect(steps[0].edgeLabel).toContain('web-ingress');
    expect(steps[5].what).toContain('app.example.com');
  });

  it('includes Ingress Controller reload, reverse proxying, and response round-trip', () => {
    const steps = createIngressLifecycleSteps('app-ing', 'app.io', '/', 'app-svc');

    // Step 1: Submit manifest
    expect(steps[0].componentName).toBe('kubectl');
    expect(steps[0].nodeStatusUpdates?.['node-external-client']).toBe('success');

    // Step 2: API server validates
    expect(steps[1].edgeLabel).toBe('POST /apis/networking.k8s.io/v1/ingresses');

    // Step 3: Ingress Controller watches
    expect(steps[2].componentName).toBe('Ingress Controller');
    expect(steps[2].nodeStatusUpdates?.['node-ingress-controller']).toBe('active');

    // Step 4: Routing rules parsing
    expect(steps[3].nodeStatusUpdates?.['node-ingress-controller']).toBe('active');

    // Step 5: Reload config
    expect(steps[4].edgeLabel).toContain('proxy upstream configured');
    expect(steps[4].nodeStatusUpdates?.['node-ingress-controller']).toBe('success');

    // Step 6: Client request
    expect(steps[5].edgeId).toBe('edge-client-ic-request');
    expect(steps[5].nodeStatusUpdates?.['node-external-client']).toBe('active');

    // Step 7: Ingress matching
    expect(steps[6].componentName).toBe('Ingress Controller');

    // Step 8: Upstream selection
    expect(steps[7].what).toContain('app-svc');

    // Step 9: Ingress controller proxies directly to Pod
    expect(steps[8].edgeId).toBe('edge-ic-proxy-pod');
    expect(steps[8].why).toContain('Direct pod routing');

    // Step 10: Pod processes request
    expect(steps[9].componentName).toBe('Backend Pod');

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

  it('sets edgeStatusUpdates consistently between active and complete across steps', () => {
    const steps = createIngressLifecycleSteps('cart-ing', 'shop.store.com', '/cart', 'cart-svc');

    expect(steps[0].edgeStatusUpdates?.['edge-user-kubectl']).toBe('active');
    expect(steps[1].edgeStatusUpdates?.['edge-user-kubectl']).toBe('complete');
    expect(steps[1].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('active');
  });
});
