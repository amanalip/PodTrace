import { describe, it, expect } from 'vitest';
import { createConfigLifecycleSteps } from './config-lifecycle.ts';

describe('config-lifecycle', () => {
  it('generates 8 steps for ConfigMap', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'web-config');
    expect(steps).toHaveLength(8);

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

  it('includes tmpfs in-memory volume details for Secret', () => {
    const steps = createConfigLifecycleSteps('Secret', 'vault-token');
    expect(steps).toHaveLength(8);

    // Step 6: tmpfs volume preparation
    expect(steps[5].edgeLabel).toContain('tmpfs in-memory filesystem');
    expect(steps[5].why).toContain('tmpfs prevents sensitive credentials from leaking');
  });

  it('includes CSI volume attachment details for PersistentVolumeClaim', () => {
    const steps = createConfigLifecycleSteps('PersistentVolumeClaim', 'mysql-pvc');
    expect(steps).toHaveLength(8);

    // Step 6: CSI Driver attachment
    expect(steps[5].edgeLabel).toContain('CSI Driver attaches block storage volume');
  });

  it('verifies final step description contains application boot status', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'app-env');
    const finalStep = steps[7];
    expect(finalStep.what).toContain('application process boots up');
  });

  it('verifies kubelet step 5 requires payload locally before container launch', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'db-props');
    const step5 = steps[4];
    expect(step5.componentName).toBe('kubelet');
    expect(step5.why).toContain('Kubelet requires the payload locally');
  });
});
