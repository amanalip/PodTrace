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
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio').length).toBe(4);

    // Answer all questions correctly
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
    expect(reviewBtn).toHaveAttribute('aria-expanded', 'false');
    expect(reviewBtn).toHaveAttribute('aria-controls', 'quiz-review-section');
    fireEvent.click(reviewBtn);

    expect(reviewBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('quiz-review-section')).toBeInTheDocument();

    // Click Done button
    const doneBtn = screen.getByTestId('quiz-done-btn');
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('displays explanation after selecting an option', () => {
    render(<QuizModal isOpen={true} onClose={() => {}} />);

    expect(screen.queryByTestId('quiz-explanation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quiz-next-btn')).not.toBeInTheDocument();

    const optBtn = screen.getByTestId('quiz-opt-0');
    fireEvent.click(optBtn);

    expect(screen.getByTestId('quiz-explanation')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-next-btn')).toBeInTheDocument();
  });

  it('closes when close button in header is clicked', () => {
    const onClose = vi.fn();
    render(<QuizModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /close quiz/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows retrying the quiz via Retake Quiz button', () => {
    render(<QuizModal isOpen={true} onClose={() => {}} />);

    // Answer all questions incorrectly (choose index !== correctIndex)
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const q = QUIZ_QUESTIONS[i];
      const wrongIndex = (q.correctIndex + 1) % 4;
      const optBtn = screen.getByTestId(`quiz-opt-${wrongIndex}`);
      fireEvent.click(optBtn);

      const nextBtn = screen.getByTestId('quiz-next-btn');
      fireEvent.click(nextBtn);
    }

    expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
    expect(screen.getByText(/Kubernetes Novice/i)).toBeInTheDocument();

    const restartBtn = screen.getByTestId('quiz-retry-btn');
    fireEvent.click(restartBtn);

    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
  });

  it('closes when overlay background is clicked', () => {
    const onClose = vi.fn();
    render(<QuizModal isOpen={true} onClose={onClose} />);

    const overlay = screen.getByTestId('quiz-modal-overlay');
    fireEvent.click(overlay);
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
