import { describe, it, expect } from 'vitest';
import { WHAT_IF_SCENARIOS, getWhatIfScenario } from './whatif-data.ts';

describe('WHAT_IF_SCENARIOS', () => {
  it('contains at least 5 realistic failure scenarios', () => {
    expect(WHAT_IF_SCENARIOS.length).toBeGreaterThanOrEqual(5);
  });

  it('provides complete data for each scenario', () => {
    WHAT_IF_SCENARIOS.forEach((scenario) => {
      expect(scenario.id).toBeTruthy();
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.category).toBeTruthy();
      expect(scenario.affectedNodeIds.length).toBeGreaterThan(0);
      expect(Object.keys(scenario.nodeStatusOverrides).length).toBeGreaterThan(0);
      expect(scenario.consequences.length).toBeGreaterThan(0);
      expect(scenario.mitigation).toBeTruthy();
    });
  });

  it('retrieves scenarios correctly by ID', () => {
    const apiserverScenario = getWhatIfScenario('apiserver-down');
    expect(apiserverScenario).not.toBeNull();
    expect(apiserverScenario?.title).toContain('API Server');

    const nonExistent = getWhatIfScenario('non-existent');
    expect(nonExistent).toBeNull();
  });
});
