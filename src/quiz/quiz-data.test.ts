import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from './quiz-data.ts';

describe('QUIZ_QUESTIONS', () => {
  it('contains exactly 10 questions', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(10);
  });

  it('has valid structure for all questions', () => {
    QUIZ_QUESTIONS.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.explanation).toBeTruthy();
      expect(q.category).toBeTruthy();

      // Ensure options are distinct
      const uniqueOpts = new Set(q.options);
      expect(uniqueOpts.size).toBe(4);
    });
  });

  it('covers all 4 key quiz categories', () => {
    const categories = new Set(QUIZ_QUESTIONS.map((q) => q.category));
    expect(categories.has('Control Plane')).toBe(true);
    expect(categories.has('Worker Node')).toBe(true);
    expect(categories.has('Networking')).toBe(true);
    expect(categories.has('Storage & Lifecycle')).toBe(true);
  });

  it('verifies question 1 correctly specifies apiserver', () => {
    const q1 = QUIZ_QUESTIONS[0];
    expect(q1.options[q1.correctIndex]).toBe('kube-apiserver');
  });

  it('verifies question 2 explains scheduler downtime consequences', () => {
    const q2 = QUIZ_QUESTIONS[1];
    expect(q2.options[q2.correctIndex]).toContain('Existing Pods continue running');
  });

  it('verifies question 3 identifies kubelet probe execution', () => {
    const q3 = QUIZ_QUESTIONS[2];
    expect(q3.options[q3.correctIndex]).toBe('kubelet');
  });

  it('verifies question 4 identifies kube-proxy network rule programming', () => {
    const q4 = QUIZ_QUESTIONS[3];
    expect(q4.options[q4.correctIndex]).toBe('kube-proxy');
  });

  it('verifies question 5 identifies cgroup memory limit trigger for OOM', () => {
    const q5 = QUIZ_QUESTIONS[4];
    expect(q5.options[q5.correctIndex]).toContain('Memory cgroup limit exceeded');
  });
});
