import { Scenario } from './scenario-types.ts';
import { K8sResource, LifecycleStep } from '../model/types.ts';

export function evaluateScenarioFix(
  scenario: Scenario,
  yaml: string,
  resources: K8sResource[],
): { isFixed: boolean; feedback?: string } {
  if (!scenario || !scenario.validator) {
    return { isFixed: false, feedback: 'Invalid scenario definition.' };
  }

  try {
    return scenario.validator(yaml, resources);
  } catch (error) {
    return {
      isFixed: false,
      feedback: error instanceof Error ? error.message : 'Validation failed.',
    };
  }
}

export function injectScenarioFailureIntoSteps(
  steps: LifecycleStep[],
  scenario: Scenario,
): LifecycleStep[] {
  const failureStepNumber = scenario.failureStep;
  const details = scenario.failureDetails;

  return steps.map((step) => {
    if (step.stepNumber === failureStepNumber) {
      return {
        ...step,
        title: `FAILED: ${step.title}`,
        what: `${step.what} (Error: ${details.errorType})`,
        why: `Failure occurred: ${details.fixHint}`,
        nodeStatusUpdates: {
          ...step.nodeStatusUpdates,
          [details.failingNodeId]: 'error',
        },
        edgeStatusUpdates: details.failingEdgeId
          ? {
              ...step.edgeStatusUpdates,
              [details.failingEdgeId]: 'error',
            }
          : step.edgeStatusUpdates,
      };
    }
    return step;
  });
}
