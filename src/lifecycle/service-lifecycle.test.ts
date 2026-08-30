import { describe, it, expect } from 'vitest';
import { createServiceLifecycleSteps } from './service-lifecycle.ts';

describe('service-lifecycle', () => {
  it('generates 10 sequential steps with valid metadata', () => {
    const steps = createServiceLifecycleSteps('web-svc', 'ClusterIP', '10.96.0.55');
    expect(steps).toHaveLength(10);

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
    const steps = createServiceLifecycleSteps();
    expect(steps).toHaveLength(10);
    expect(steps[0].edgeLabel).toContain('backend-service');
    expect(steps[2].what).toContain('10.96.0.42');
  });

  it('includes ClusterIP allocation, EndpointSlice generation, iptables programming, and CoreDNS registration', () => {
    const steps = createServiceLifecycleSteps('api-svc', 'ClusterIP', '10.96.100.200');

    // Step 1: Client applies service
    expect(steps[0].edgeLabel).toBe('kubectl apply -f api-svc.yaml');
    expect(steps[0].componentName).toBe('kubectl');

    // Step 2: API Server validates
    expect(steps[1].edgeLabel).toBe('POST /api/v1/services');

    // Step 3: ClusterIP allocation
    expect(steps[2].what).toContain('10.96.100.200');
    expect(steps[2].nodeStatusUpdates?.['node-service-api-svc']).toBe('active');

    // Step 4: EndpointSlice Controller matches Pods
    expect(steps[3].componentName).toBe('EndpointSlice Controller');
    expect(steps[3].nodeStatusUpdates?.['node-controllermanager']).toBe('active');

    // Step 5: EndpointSlice creation
    expect(steps[4].edgeId).toBe('edge-cm-create-epslice');
    expect(steps[4].targetNodeId).toBe('node-endpointslice-api-svc');

    // Step 6: API Server persistence
    expect(steps[5].nodeStatusUpdates?.['node-endpointslice-api-svc']).toBe('success');

    // Step 7: Kube-proxy detection
    expect(steps[6].nodeStatusUpdates?.['node-kubeproxy-1']).toBe('active');
    expect(steps[6].nodeStatusUpdates?.['node-kubeproxy-2']).toBe('active');

    // Step 8: iptables rule programming
    expect(steps[7].edgeId).toBe('edge-proxy-rules-1');
    expect(steps[7].componentName).toBe('kube-proxy');
    expect(steps[7].what).toContain('10.96.100.200');

    // Step 9: CoreDNS registration
    expect(steps[8].edgeId).toBe('edge-coredns-watch');
    expect(steps[8].componentName).toBe('CoreDNS');
    expect(steps[8].edgeLabel).toContain('api-svc.default.svc.cluster.local');

    // Step 10: Service ready and routable
    expect(steps[9].nodeStatusUpdates?.['node-service-api-svc']).toBe('success');
    expect(steps[9].nodeStatusUpdates?.['node-endpointslice-api-svc']).toBe('success');
  });

  it('handles NodePort service type correctly', () => {
    const steps = createServiceLifecycleSteps('nodeport-svc', 'NodePort', '10.96.20.10');
    expect(steps).toHaveLength(10);
    expect(steps[0].title).toContain('Service');
    expect(steps[9].edgeLabel).toContain('NodePort');
  });

  it('handles LoadBalancer service type correctly', () => {
    const steps = createServiceLifecycleSteps('lb-svc', 'LoadBalancer', '10.96.50.60');
    expect(steps).toHaveLength(10);
    expect(steps[0].title).toContain('Service');
    expect(steps[9].edgeLabel).toContain('LoadBalancer');
  });

  it('sets edgeStatusUpdates to active on current edge and complete on prior edge across steps', () => {
    const steps = createServiceLifecycleSteps('order-svc', 'ClusterIP', '10.96.33.44');

    expect(steps[1].edgeStatusUpdates?.['edge-user-kubectl']).toBe('complete');
    expect(steps[1].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('active');

    expect(steps[2].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('complete');
    expect(steps[2].edgeStatusUpdates?.['edge-apiserver-etcd']).toBe('active');
  });
});
