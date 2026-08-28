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
});
