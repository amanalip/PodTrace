import { describe, it, expect } from 'vitest';
import { createConfigLifecycleSteps } from './config-lifecycle.ts';

describe('config-lifecycle', () => {
  it('generates 8 steps for ConfigMap with valid metadata', () => {
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
      expect(step.docsUrl).toMatch(/^https:\/\/kubernetes\.io\/docs\//);
      expect(step.durationMs).toBe(2000);
    });
  });

  it('uses default arguments when called with no parameters', () => {
    const steps = createConfigLifecycleSteps();
    expect(steps).toHaveLength(8);
    expect(steps[0].edgeLabel).toBe('kubectl apply -f app-config.yaml');
    expect(steps[0].title).toContain('ConfigMap');
  });

  it('includes tmpfs in-memory volume details for Secret', () => {
    const steps = createConfigLifecycleSteps('Secret', 'vault-token');
    expect(steps).toHaveLength(8);

    // Step 2: Secret size and base64 check
    expect(steps[1].what).toContain('base64');

    // Step 3: etcd encryption check
    expect(steps[2].what).toContain('encrypted at rest');

    // Step 6: tmpfs volume preparation
    expect(steps[5].edgeLabel).toContain('tmpfs in-memory filesystem');
    expect(steps[5].why).toContain('tmpfs prevents sensitive credentials from leaking');
  });

  it('includes CSI volume attachment details for PersistentVolumeClaim', () => {
    const steps = createConfigLifecycleSteps('PersistentVolumeClaim', 'mysql-pvc');
    expect(steps).toHaveLength(8);

    // Step 2: PVC validation
    expect(steps[1].what).toContain('storageClassName');

    // Step 6: CSI Driver attachment
    expect(steps[5].edgeLabel).toContain('CSI Driver attaches block storage volume');
  });

  it('verifies final step description contains application boot status', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'app-env');
    const finalStep = steps[7];
    expect(finalStep.what).toContain('application process boots up');
    expect(finalStep.nodeStatusUpdates?.['node-pod-consumer']).toBe('success');
  });

  it('verifies kubelet step 5 requires payload locally before container launch', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'db-props');
    const step5 = steps[4];
    expect(step5.componentName).toBe('kubelet');
    expect(step5.why).toContain('Kubelet requires the payload locally');
  });

  it('transitions edges between active and complete across steps', () => {
    const steps = createConfigLifecycleSteps('ConfigMap', 'my-config');

    expect(steps[0].edgeStatusUpdates?.['edge-user-kubectl']).toBe('active');
    expect(steps[1].edgeStatusUpdates?.['edge-user-kubectl']).toBe('complete');
    expect(steps[1].edgeStatusUpdates?.['edge-kubectl-apiserver']).toBe('active');
  });
});
