import { describe, it, expect } from 'vitest';
import { createServiceLifecycleSteps } from './service-lifecycle.ts';

describe('service-lifecycle', () => {
  it('generates 10 sequential steps', () => {
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
    });
  });

  it('includes ClusterIP allocation, EndpointSlice generation, iptables programming, and CoreDNS registration', () => {
    const steps = createServiceLifecycleSteps('api-svc', 'ClusterIP', '10.96.100.200');

    // Step 3: ClusterIP allocation
    expect(steps[2].what).toContain('10.96.100.200');

    // Step 5: EndpointSlice creation
    expect(steps[4].edgeId).toBe('edge-cm-create-epslice');

    // Step 8: iptables rule programming
    expect(steps[7].edgeId).toBe('edge-proxy-rules-1');
    expect(steps[7].componentName).toBe('kube-proxy');

    // Step 9: CoreDNS registration
    expect(steps[8].edgeId).toBe('edge-coredns-watch');
    expect(steps[8].componentName).toBe('CoreDNS');
  });
});
