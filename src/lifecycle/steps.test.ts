import { describe, it, expect } from 'vitest';
import { getLifecycleStepsForResources } from './steps.ts';
import { K8sResource } from '../model/types.ts';

describe('steps router', () => {
  it('returns Pod lifecycle steps when given a Pod resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'my-app' },
        spec: { containers: [{ name: 'app', image: 'app:1.0' }] },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps).toHaveLength(9);
    expect(steps[0].edgeLabel).toContain('my-app.yaml');
  });

  it('returns default pod lifecycle steps when empty', () => {
    const steps = getLifecycleStepsForResources([]);
    expect(steps).toHaveLength(9);
  });
});
