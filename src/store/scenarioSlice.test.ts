import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';
import { Scenario } from '../scenarios/scenario-types.ts';

describe('scenarioSlice in useAppStore', () => {
  const mockScenario: Scenario = {
    id: 'mock-scenario-1',
    title: 'Mock Image Pull Failure',
    category: 'pod-lifecycle',
    difficulty: 'Beginner',
    description: 'Fix the container image',
    yamlTemplate: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: web\n    image: broken-img:1.0',
    failureStep: 8,
    failureDetails: {
      errorType: 'ImagePullBackOff',
      failingStep: 8,
      failingNodeId: 'node-runtime',
      logs: [],
      events: [],
      fixHint: 'Use nginx:1.27',
    },
    successMessage: 'Pod started successfully!',
    explanation: 'ImagePullBackOff occurs when image is missing.',
    validator: (yaml) => ({
      isFixed: yaml.includes('nginx:1.27'),
      feedback: yaml.includes('nginx:1.27') ? undefined : 'Use nginx:1.27',
    }),
  };

  beforeEach(() => {
    useAppStore.setState({
      activeScenarioId: null,
      activeScenario: null,
      scenarioState: 'idle',
      scenarioFeedback: null,
      completedScenarioIds: [],
    });
  });

  it('loads a scenario and transitions to failed state with failure step', () => {
    const store = useAppStore.getState();
    store.loadScenario(mockScenario);

    const updated = useAppStore.getState();
    expect(updated.activeScenarioId).toBe('mock-scenario-1');
    expect(updated.scenarioState).toBe('failed');
    expect(updated.yaml).toContain('broken-img:1.0');
    expect(updated.steps.length).toBeGreaterThan(0);
  });

  it('checks fix and transitions to resolved state when valid', () => {
    const store = useAppStore.getState();
    store.loadScenario(mockScenario);

    const fixed = store.checkScenarioFix('image: nginx:1.27', []);
    expect(fixed).toBe(true);

    const updated = useAppStore.getState();
    expect(updated.scenarioState).toBe('resolved');
    expect(updated.scenarioFeedback).toBe(mockScenario.successMessage);
  });

  it('resolves and marks scenario as completed', () => {
    const store = useAppStore.getState();
    store.loadScenario(mockScenario);
    store.resolveScenario();

    const updated = useAppStore.getState();
    expect(updated.scenarioState).toBe('completed');
    expect(updated.completedScenarioIds).toContain('mock-scenario-1');
  });
});
