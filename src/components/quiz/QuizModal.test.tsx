import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizModal } from './QuizModal.tsx';
import { QUIZ_QUESTIONS } from '../../quiz/quiz-data.ts';

describe('QuizModal', () => {
  it('does not render when closed', () => {
    render(<QuizModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByTestId('quiz-modal')).not.toBeInTheDocument();
  });

  it('renders question and advances through quiz with review', () => {
    const onClose = vi.fn();
    render(<QuizModal isOpen={true} onClose={onClose} />);

    expect(screen.getByTestId('quiz-modal')).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();

    // Answer all questions
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const q = QUIZ_QUESTIONS[i];
      const optBtn = screen.getByTestId(`quiz-opt-${q.correctIndex}`);
      fireEvent.click(optBtn);

      const nextBtn = screen.getByTestId('quiz-next-btn');
      fireEvent.click(nextBtn);
    }

    // Results screen
    expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
    expect(screen.getByText(/Kubernetes Master/i)).toBeInTheDocument();

    // Toggle Review
    const reviewBtn = screen.getByTestId('quiz-toggle-review-btn');
    fireEvent.click(reviewBtn);

    expect(screen.getByTestId('quiz-review-section')).toBeInTheDocument();

    // Click Done button
    const doneBtn = screen.getByTestId('quiz-done-btn');
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders accessible progress bar and closes on Escape key press', () => {
    const onClose = vi.fn();
    render(<QuizModal isOpen={true} onClose={onClose} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
