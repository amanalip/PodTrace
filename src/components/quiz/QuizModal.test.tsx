import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizModal } from './QuizModal.tsx';
import { QUIZ_QUESTIONS } from '../../quiz/quiz-data.ts';

describe('QuizModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<QuizModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders question and options when open', () => {
    render(<QuizModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('quiz-modal')).toBeInTheDocument();
    expect(screen.getByText(QUIZ_QUESTIONS[0].question)).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
  });

  it('reveals explanation and enables Next button on option click', () => {
    render(<QuizModal isOpen={true} onClose={vi.fn()} />);

    // Click correct answer for Q1 (kube-apiserver)
    const optBtn = screen.getByRole('button', { name: 'kube-apiserver' });
    fireEvent.click(optBtn);

    expect(screen.getByTestId('quiz-explanation')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-next-btn')).toBeInTheDocument();

    // Advance to next question
    fireEvent.click(screen.getByTestId('quiz-next-btn'));
    expect(screen.getByText('Question 2 of 10')).toBeInTheDocument();
  });
});
