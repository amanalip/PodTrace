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
    });
  });
});
