import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';
import { SCENARIO_CATALOG } from '../scenarios/scenario-data.ts';

describe('scenariosSlice in useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeScenarioId: null,
      activeScenario: null,
      scenarioState: 'idle',
      scenarioFeedback: null,
      completedScenarioIds: [],
    });
  });

  it('loads scenario, sets state to failed, and loads broken template into editor', () => {
    const scenario = SCENARIO_CATALOG[0];
    const store = useAppStore.getState();
    store.loadScenario(scenario);

    const state = useAppStore.getState();
    expect(state.activeScenarioId).toBe(scenario.id);
    expect(state.activeScenario).toEqual(scenario);
    expect(state.scenarioState).toBe('failed');
    expect(state.yaml).toBe(scenario.yamlTemplate);
    expect(state.nodes.length).toBeGreaterThan(0);
    expect(state.steps.length).toBeGreaterThan(0);
  });

  it('evaluates checkScenarioFix and updates scenarioState to fixing on failure or resolved on fix', () => {
    const scenario = SCENARIO_CATALOG.find((s) => s.id === 'crashloopbackoff')!;
    const store = useAppStore.getState();
    store.loadScenario(scenario);

    // Unfixed check
    const isFixedFalse = store.checkScenarioFix(scenario.yamlTemplate, []);
    expect(isFixedFalse).toBe(false);
    expect(useAppStore.getState().scenarioState).toBe('fixing');
    expect(useAppStore.getState().scenarioFeedback).toBeTruthy();

    // Fixed check
    const fixedYaml = 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: web\n    image: busybox\n    command: ["sleep", "3600"]';
    const isFixedTrue = store.checkScenarioFix(fixedYaml, []);
    expect(isFixedTrue).toBe(true);
    expect(useAppStore.getState().scenarioState).toBe('resolved');
    expect(useAppStore.getState().scenarioFeedback).toBe(scenario.successMessage);
    expect(useAppStore.getState().completedScenarioIds).toContain(scenario.id);
  });

  it('marks scenario as completed and persists to completedScenarioIds list', () => {
    const store = useAppStore.getState();
    store.markScenarioCompleted('test-scenario-1');
    expect(useAppStore.getState().completedScenarioIds).toContain('test-scenario-1');

    // Duplicate additions are ignored
    store.markScenarioCompleted('test-scenario-1');
    expect(useAppStore.getState().completedScenarioIds).toHaveLength(1);
  });

  it('resolves active scenario and transitions state to completed', () => {
    const scenario = SCENARIO_CATALOG[0];
    const store = useAppStore.getState();
    store.loadScenario(scenario);
    store.resolveScenario();

    const state = useAppStore.getState();
    expect(state.scenarioState).toBe('completed');
    expect(state.completedScenarioIds).toContain(scenario.id);
  });

  it('resets active scenario back to its initial failed state and template', () => {
    const scenario = SCENARIO_CATALOG[0];
    const store = useAppStore.getState();
    store.loadScenario(scenario);

    // Modify YAML
    store.setYaml('modified yaml content');
    store.setScenarioState('fixing');

    // Reset
    store.resetScenario();
    const state = useAppStore.getState();
    expect(state.scenarioState).toBe('failed');
    expect(state.yaml).toBe(scenario.yamlTemplate);
  });

  it('handles resetScenario when no active scenario is set', () => {
    const store = useAppStore.getState();
    store.resetScenario();

    const state = useAppStore.getState();
    expect(state.activeScenarioId).toBeNull();
    expect(state.scenarioState).toBe('idle');
  });

  it('updates scenario feedback and active scenario ID directly', () => {
    const store = useAppStore.getState();
    store.setActiveScenarioId('custom-id');
    store.setScenarioFeedback('Custom feedback message');

    const state = useAppStore.getState();
    expect(state.activeScenarioId).toBe('custom-id');
    expect(state.scenarioFeedback).toBe('Custom feedback message');
  });
});
