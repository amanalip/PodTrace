import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from './quiz-data.ts';

describe('quiz-data', () => {
  it('contains valid quiz questions with 4 options and valid correctIndex', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(10);

    QUIZ_QUESTIONS.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
      expect(q.category).toMatch(/^(Control Plane|Worker Node|Networking|Storage & Lifecycle)$/);
    });
  });

  it('verifies unique question IDs across quiz pool', () => {
    const ids = QUIZ_QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('verifies question 1 correctly identifies kube-apiserver as sole etcd communicator', () => {
    const q1 = QUIZ_QUESTIONS.find((q) => q.id === 'q1');
    expect(q1).toBeDefined();
    expect(q1?.options[q1.correctIndex]).toBe('kube-apiserver');
  });

  it('verifies question 3 correctly identifies kubelet for health probes', () => {
    const q3 = QUIZ_QUESTIONS.find((q) => q.id === 'q3');
    expect(q3).toBeDefined();
    expect(q3?.options[q3.correctIndex]).toBe('kubelet');
  });

  it('verifies question 4 correctly identifies kube-proxy for iptables/IPVS routing', () => {
    const q4 = QUIZ_QUESTIONS.find((q) => q.id === 'q4');
    expect(q4).toBeDefined();
    expect(q4?.options[q4.correctIndex]).toBe('kube-proxy');
  });
});
