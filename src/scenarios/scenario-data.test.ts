import { describe, it, expect } from 'vitest';
import { SCENARIO_CATALOG } from './scenario-data.ts';
import { ScenarioCategory } from './scenario-types.ts';

describe('SCENARIO_CATALOG (15 Troubleshooting Scenarios)', () => {
  it('contains exactly 15 scenarios', () => {
    expect(SCENARIO_CATALOG).toHaveLength(15);
  });

  it('covers all 6 scenario categories', () => {
    const categories = new Set(SCENARIO_CATALOG.map((s) => s.category));
    const expectedCategories: ScenarioCategory[] = [
      'pod-lifecycle',
      'scheduling',
      'networking',
      'storage',
      'security',
      'scale-update',
    ];

    expectedCategories.forEach((cat) => {
      expect(categories.has(cat)).toBe(true);
    });
  });

  it('has valid structure and passing validator for every scenario', () => {
    SCENARIO_CATALOG.forEach((sc) => {
      expect(sc.id).toBeTruthy();
      expect(sc.title).toBeTruthy();
      expect(sc.description).toBeTruthy();
      expect(sc.yamlTemplate).toBeTruthy();
      expect(sc.failureStep).toBeGreaterThan(0);
      expect(sc.failureDetails.errorType).toBeTruthy();
      expect(sc.failureDetails.failingNodeId).toBeTruthy();
      expect(sc.failureDetails.fixHint).toBeTruthy();
      expect(sc.successMessage).toBeTruthy();
      expect(sc.explanation).toBeTruthy();

      // Initial template should be unfixed
      const initialEval = sc.validator(sc.yamlTemplate, []);
      expect(initialEval.isFixed).toBe(false);
    });
  });

  it('evaluates crashloopbackoff fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'crashloopbackoff')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('spec:\n  containers:\n  - name: web\n    image: busybox\n    command: ["sleep", "3600"]', []).isFixed).toBe(true);
  });

  it('evaluates imagepullbackoff fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'imagepullbackoff')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('image: nginx:alpine', []).isFixed).toBe(true);
    expect(sc.validator('image: nginx:1.27', []).isFixed).toBe(true);
  });

  it('evaluates oomkilled fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'oomkilled')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('resources:\n  limits:\n    memory: "256Mi"', []).isFixed).toBe(true);
    expect(sc.validator('resources:\n  limits:\n    memory: "1Gi"', []).isFixed).toBe(true);
  });

  it('evaluates unschedulable-cpu fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'unschedulable-cpu')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('resources:\n  requests:\n    cpu: "500m"', []).isFixed).toBe(true);
    expect(sc.validator('resources:\n  requests:\n    cpu: "1"', []).isFixed).toBe(true);
  });

  it('evaluates nodeselector-mismatch fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'nodeselector-mismatch')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('spec:\n  containers:\n  - name: worker\n    image: nginx:alpine', []).isFixed).toBe(true);
  });

  it('evaluates taint-toleration fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'taint-toleration')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('tolerations:\n- key: "dedicated"\n  operator: "Equal"\n  value: "special"', []).isFixed).toBe(true);
  });

  it('evaluates service-selector-mismatch fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'service-selector-mismatch')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('selector:\n  app: web-server', []).isFixed).toBe(true);
  });

  it('evaluates port-mismatch fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'port-mismatch')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('ports:\n- port: 80\n  targetPort: 80', []).isFixed).toBe(true);
  });

  it('evaluates networkpolicy-blocked fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'networkpolicy-blocked')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('spec:\n  ingress:\n  - from:\n    - podSelector: {}', []).isFixed).toBe(true);
  });

  it('evaluates configmap-missing-key fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'configmap-missing-key')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('configMapKeyRef:\n  name: app-config\n  key: DB_HOST', []).isFixed).toBe(true);
    expect(sc.validator('configMapKeyRef:\n  name: app-config\n  optional: true', []).isFixed).toBe(true);
  });

  it('evaluates pvc-pending fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'pvc-pending')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('storageClassName: standard', []).isFixed).toBe(true);
    expect(sc.validator('storageClassName: gp3', []).isFixed).toBe(true);
  });

  it('evaluates readonly-rootfs fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'readonly-rootfs')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('volumes:\n- name: tmp\n  emptyDir: {}', []).isFixed).toBe(true);
  });

  it('evaluates non-root-violation fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'non-root-violation')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('securityContext:\n  runAsUser: 1000', []).isFixed).toBe(true);
  });

  it('evaluates deployment-max-unavailable fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'deployment-max-unavailable')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('rollingUpdate:\n  maxSurge: 1\n  maxUnavailable: 0', []).isFixed).toBe(true);
  });

  it('evaluates hpa-missing-metrics fix correctly', () => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === 'hpa-missing-metrics')!;
    expect(sc.validator(sc.yamlTemplate, []).isFixed).toBe(false);
    expect(sc.validator('resources:\n  requests:\n    cpu: "100m"', []).isFixed).toBe(true);
  });
});
