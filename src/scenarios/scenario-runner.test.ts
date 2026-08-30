import { describe, it, expect } from 'vitest';
import { evaluateScenarioFix, injectScenarioFailureIntoSteps } from './scenario-runner.ts';
import { SCENARIO_CATALOG } from './scenario-data.ts';
import { Scenario } from './scenario-types.ts';
import { LifecycleStep } from '../model/types.ts';

describe('scenario-runner', () => {
  const dummyScenario: Scenario = {
    id: 'test-scenario',
    title: 'Test Scenario',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'Fix invalid image tag',
    yamlTemplate: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: test-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:invalid-tag',
    failureStep: 8,
    failureDetails: {
      errorType: 'ErrImagePull',
      failingStep: 8,
      failingNodeId: 'node-kubelet',
      failingEdgeId: 'edge-kubelet-runtime',
      logs: [],
      events: [],
      fixHint: 'Change image tag to a valid version such as nginx:latest',
    },
    successMessage: 'Great job fixing the image tag!',
    explanation: 'ImagePullBackOff occurs when the container runtime cannot pull the requested image.',
    validator: (yaml) => {
      if (yaml.includes('nginx:latest') || yaml.includes('nginx:alpine')) {
        return { isFixed: true };
      }
      return { isFixed: false, feedback: 'Please update image tag to nginx:latest' };
    },
  };

  const sampleSteps: LifecycleStep[] = [
    {
      stepNumber: 7,
      title: 'Kubelet receives pod',
      sourceNodeId: 'node-apiserver',
      targetNodeId: 'node-kubelet',
      edgeId: 'edge-apiserver-kubelet',
      what: 'Kubelet notices pod assignment',
      why: 'Pod needs to run on node',
      componentName: 'kubelet',
      componentRole: 'Node agent',
    },
    {
      stepNumber: 8,
      title: 'Container Runtime pulls image',
      sourceNodeId: 'node-kubelet',
      targetNodeId: 'node-runtime',
      edgeId: 'edge-kubelet-runtime',
      what: 'Runtime attempts to pull image',
      why: 'Image is required to launch container',
      componentName: 'Container Runtime',
      componentRole: 'Image puller',
    },
  ];

  it('injects failure state into designated step and node', () => {
    const stepsWithFailure = injectScenarioFailureIntoSteps(sampleSteps, dummyScenario);
    const failedStep = stepsWithFailure.find((s) => s.stepNumber === 8);

    expect(failedStep?.title).toContain('FAILED');
    expect(failedStep?.nodeStatusUpdates?.['node-kubelet']).toBe('error');
    expect(failedStep?.edgeStatusUpdates?.['edge-kubelet-runtime']).toBe('error');
  });

  it('evaluates validator correctly on fix', () => {
    const resultUnfixed = evaluateScenarioFix(dummyScenario, 'image: nginx:invalid-tag', []);
    expect(resultUnfixed.isFixed).toBe(false);
    expect(resultUnfixed.feedback).toContain('Please update image tag');

    const resultFixed = evaluateScenarioFix(dummyScenario, 'image: nginx:latest', []);
    expect(resultFixed.isFixed).toBe(true);
  });

  it('handles scenarios without failing edges gracefully', () => {
    const scenarioWithoutEdge: Scenario = {
      ...dummyScenario,
      failureDetails: {
        ...dummyScenario.failureDetails,
        failingEdgeId: undefined,
      },
    };

    const stepsWithFailure = injectScenarioFailureIntoSteps(sampleSteps, scenarioWithoutEdge);
    const failedStep = stepsWithFailure.find((s) => s.stepNumber === 8);

    expect(failedStep?.title).toContain('FAILED');
    expect(failedStep?.nodeStatusUpdates?.['node-kubelet']).toBe('error');
  });

  it('returns failure when scenario definition is invalid or missing validator', () => {
    const brokenScenario = { id: 'no-val' } as unknown as Scenario;
    const result = evaluateScenarioFix(brokenScenario, 'dummy', []);

    expect(result.isFixed).toBe(false);
    expect(result.feedback).toBe('Invalid scenario definition.');
  });

  it('catches runtime exceptions thrown inside custom validator functions', () => {
    const throwingScenario: Scenario = {
      ...dummyScenario,
      validator: () => {
        throw new Error('Custom validator crash');
      },
    };

    const result = evaluateScenarioFix(throwingScenario, 'dummy', []);
    expect(result.isFixed).toBe(false);
    expect(result.feedback).toBe('Custom validator crash');
  });

  it('verifies all catalog scenarios fail on their initial broken templates', () => {
    SCENARIO_CATALOG.forEach((scenario) => {
      const evaluation = evaluateScenarioFix(scenario, scenario.yamlTemplate, []);
      expect(
        evaluation.isFixed,
        `Scenario ${scenario.id} should fail on its template YAML`,
      ).toBe(false);
      expect(evaluation.feedback).toBeTruthy();
    });
  });

  it('evaluates fix for CrashLoopBackOff scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'crashloopbackoff');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: web\n    image: busybox\n    command: ["sleep", "3600"]';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for ImagePullBackOff scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'imagepullbackoff');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: nginx\n    image: nginx:alpine';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for OOMKilled scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'oomkilled');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'resources:\n  limits:\n    memory: "256Mi"\n  requests:\n    memory: "256Mi"';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for Insufficient CPU scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'unschedulable-cpu');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'resources:\n  requests:\n    cpu: "500m"';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for NodeSelector Mismatch scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'nodeselector-mismatch');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: gpu-processor\nspec:\n  containers:\n  - name: worker\n    image: nginx:alpine';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for Taint Toleration scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'taint-toleration');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'spec:\n  tolerations:\n  - key: dedicated\n    operator: Equal\n    value: special';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for Service Selector Mismatch scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'service-selector-mismatch');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'spec:\n  selector:\n    app: web-server\n  ports:\n  - port: 80\n    targetPort: 80';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for Port Mismatch scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'port-mismatch');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'ports:\n- port: 80\n  targetPort: 80';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for ConfigMap Missing Key scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'configmap-missing-key');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'configMapKeyRef:\n  name: app-config\n  key: DB_HOST\n  optional: true';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for PVC Pending scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'pvc-pending');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'apiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  storageClassName: standard';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for ReadOnlyRootFilesystem scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'readonly-rootfs');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'volumes:\n- name: tmp-dir\n  emptyDir: {}\nvolumeMounts:\n- name: tmp-dir\n  mountPath: /tmp';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for RunAsNonRoot scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'non-root-violation');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'securityContext:\n  runAsNonRoot: true\n  runAsUser: 1000';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for Deadlocked Rolling Update scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'deployment-max-unavailable');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'strategy:\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });

  it('evaluates fix for HPA Missing Metrics scenario', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'hpa-missing-metrics');
    expect(scenario).toBeDefined();
    if (scenario) {
      const fixedYaml = 'spec:\n  containers:\n  - name: server\n    resources:\n      requests:\n        cpu: 100m';
      expect(evaluateScenarioFix(scenario, fixedYaml, []).isFixed).toBe(true);
    }
  });
});
