import { describe, it, expect } from 'vitest';
import { WHAT_IF_SCENARIOS, getWhatIfScenario } from './whatif-data.ts';

describe('whatif-data', () => {
  it('contains all 5 standard what-if scenarios with valid metadata', () => {
    expect(WHAT_IF_SCENARIOS.length).toBeGreaterThanOrEqual(5);

    WHAT_IF_SCENARIOS.forEach((scenario) => {
      expect(scenario.id).toBeTruthy();
      expect(scenario.title).toMatch(/^What if /);
      expect(scenario.category).toMatch(/^(control-plane|worker-node|networking)$/);
      expect(scenario.description).toBeTruthy();
      expect(scenario.affectedNodeIds.length).toBeGreaterThan(0);
      expect(Object.keys(scenario.nodeStatusOverrides).length).toBeGreaterThan(0);
      expect(scenario.consequences.length).toBeGreaterThan(0);
      expect(scenario.mitigation).toBeTruthy();
    });
  });

  it('retrieves scenarios by ID using getWhatIfScenario', () => {
    const apiDown = getWhatIfScenario('apiserver-down');
    expect(apiDown).toBeDefined();
    expect(apiDown?.title).toBe('What if the API Server goes down?');

    const workerFail = getWhatIfScenario('worker-node-fail');
    expect(workerFail).toBeDefined();
    expect(workerFail?.category).toBe('worker-node');

    const etcdQuorum = getWhatIfScenario('etcd-quorum-loss');
    expect(etcdQuorum).toBeDefined();
    expect(etcdQuorum?.category).toBe('control-plane');

    const dnsCrash = getWhatIfScenario('coredns-crash');
    expect(dnsCrash).toBeDefined();
    expect(dnsCrash?.category).toBe('networking');

    const plegFail = getWhatIfScenario('kubelet-unresponsive');
    expect(plegFail).toBeDefined();
    expect(plegFail?.category).toBe('worker-node');
  });

  it('returns null for non-existent scenario ID in getWhatIfScenario', () => {
    expect(getWhatIfScenario('nonexistent-what-if-id')).toBeNull();
    expect(getWhatIfScenario('')).toBeNull();
  });
});
