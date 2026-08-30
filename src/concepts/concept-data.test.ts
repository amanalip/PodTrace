import { describe, it, expect } from 'vitest';
import { CONCEPT_CARDS } from './concept-data.ts';

describe('concept-data', () => {
  it('contains all standard concept cards with valid metadata and official doc URLs', () => {
    expect(CONCEPT_CARDS.length).toBeGreaterThanOrEqual(9);

    CONCEPT_CARDS.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.title).toMatch(/^What is /);
      expect(card.definition).toBeTruthy();
      expect(card.keyFact).toBeTruthy();
      expect(card.docsUrl).toMatch(/^https:\/\/kubernetes\.io\/docs\//);
    });
  });

  it('verifies unique concept card IDs', () => {
    const ids = CONCEPT_CARDS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('verifies key facts for critical Kubernetes components', () => {
    const apiServer = CONCEPT_CARDS.find((c) => c.id === 'api-server');
    expect(apiServer?.keyFact).toContain('etcd');

    const etcd = CONCEPT_CARDS.find((c) => c.id === 'etcd');
    expect(etcd?.keyFact).toContain('Raft');

    const kubelet = CONCEPT_CARDS.find((c) => c.id === 'kubelet');
    expect(kubelet?.keyFact).toContain('CRI');

    const kubeProxy = CONCEPT_CARDS.find((c) => c.id === 'kube-proxy');
    expect(kubeProxy?.keyFact).toContain('iptables');
  });
});
