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

  it('verifies apiserver-down overrides node status to error', () => {
    const sc = getWhatIfScenario('apiserver-down')!;
    expect(sc.nodeStatusOverrides['node-apiserver']).toBe('error');
    expect(sc.consequences.some((c) => c.includes('connection refused'))).toBe(true);
  });

  it('verifies worker-node-fail consequences include lease renewals and pod eviction', () => {
    const sc = getWhatIfScenario('worker-node-fail')!;
    expect(sc.nodeStatusOverrides['node-kubelet']).toBe('error');
    expect(sc.nodeStatusOverrides['node-pod']).toBe('error');
    expect(sc.consequences.some((c) => c.includes('heartbeats'))).toBe(true);
  });

  it('verifies kubelet-unresponsive scenario covers PLEG failure', () => {
    const sc = getWhatIfScenario('kubelet-unresponsive')!;
    expect(sc.nodeStatusOverrides['node-kubelet']).toBe('error');
    expect(sc.mitigation).toContain('PLEG');
  });

  it('verifies etcd-quorum-loss scenario covers write rejections', () => {
    const sc = getWhatIfScenario('etcd-quorum-loss')!;
    expect(sc.nodeStatusOverrides['node-etcd']).toBe('error');
    expect(sc.consequences.some((c) => c.includes('rejects all write requests'))).toBe(true);
  });

  it('verifies coredns-crash scenario covers service discovery DNS resolution', () => {
    const sc = getWhatIfScenario('coredns-crash')!;
    expect(sc.category).toBe('networking');
    expect(sc.consequences.some((c) => c.includes('Internal Kubernetes service discovery'))).toBe(true);
  });
});
