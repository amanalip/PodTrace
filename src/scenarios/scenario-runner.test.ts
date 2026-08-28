import { describe, it, expect } from 'vitest';
import { evaluateScenarioFix, injectScenarioFailureIntoSteps } from './scenario-runner.ts';
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
});
