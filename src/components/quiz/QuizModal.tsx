import React, { useState } from 'react';
import { X, Award, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../quiz/quiz-data.ts';
import styles from './QuizModal.module.css';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setAnswers((prev) => [...prev, idx]);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setIsCompleted(false);
    setShowReview(false);
  };

  const getRankBadge = () => {
    const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((score / total) * 100))) : 0;
    if (percentage === 100) return 'Kubernetes Master';
    if (percentage >= 70) return 'Cluster Operator';
    if (percentage >= 40) return 'Kubernetes Apprentice';
    return 'Kubernetes Novice';
  };

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="quiz-modal-overlay">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kubernetes Architecture Quiz"
        data-testid="quiz-modal"
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <Award size={18} color="#38bdf8" />
            <div className={styles.title}>Kubernetes Architecture Quiz</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Quiz"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {isCompleted ? (
            <div className={styles.resultsCard} data-testid="quiz-results">
              <Award size={48} color="#38bdf8" />
              <div className={styles.scoreValue}>
                {score} / {total}
              </div>
              <div className={styles.scoreBadge}>{getRankBadge()}</div>
              <p style={{ color: '#cbd5e1', fontSize: 13 }}>
                You scored {total > 0 ? Math.min(100, Math.max(0, Math.round((score / total) * 100))) : 0}% on the Kubernetes architecture and lifecycle assessment.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: 12 }}>
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={() => setShowReview(!showReview)}
                  aria-expanded={showReview}
                  aria-controls="quiz-review-section"
                  data-testid="quiz-toggle-review-btn"
                >
                  <span>{showReview ? 'Hide Review' : 'Review Answers'}</span>
                </button>

                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleReset}
                  data-testid="quiz-retry-btn"
                >
                  <RotateCcw size={14} />
                  <span>Retry Quiz</span>
                </button>

                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={onClose}
                  data-testid="quiz-done-btn"
                >
                  <span>Done</span>
                </button>
              </div>

              {showReview && (
                <div
                  id="quiz-review-section"
                  style={{ marginTop: 16, textAlign: 'left', width: '100%' }}
                  data-testid="quiz-review-section"
                >
                  {QUIZ_QUESTIONS.map((q, qIdx) => {
                    const userAns = answers[qIdx];
                    const isCorrect = userAns === q.correctIndex;

                    return (
                      <div
                        key={q.id}
                        style={{
                          marginBottom: 12,
                          padding: 10,
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 6,
                          borderLeft: `3px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                          {qIdx + 1}. {q.question}
                        </div>
                        <div style={{ fontSize: 11, color: isCorrect ? '#22c55e' : '#ef4444' }}>
                          Your answer: {userAns !== null && userAns !== undefined ? q.options[userAns] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>
                            Correct answer: {q.options[q.correctIndex]}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.progressRow}>
                <span>
                  Question {currentIndex + 1} of {total}
                </span>
                <span className={styles.badgeCategory}>{currentQ.category}</span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={currentIndex + 1}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-label={`Question ${currentIndex + 1} of ${total}`}
                style={{
                  width: '100%',
                  height: 4,
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 6,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: `${((currentIndex + 1) / total) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                    transition: 'width 0.2s ease',
                  }}
                  data-testid="quiz-progress-bar"
                />
              </div>

              <div className={styles.questionText}>{currentQ.question}</div>

              <div
                className={styles.optionsList}
                role="radiogroup"
                aria-label={`Options for question ${currentIndex + 1}: ${currentQ.question}`}
              >
                {currentQ.options.map((opt, idx) => {
                  let optionClass = styles.optionBtn;
                  if (selectedAnswer !== null) {
                    if (idx === currentQ.correctIndex) {
                      optionClass = `${styles.optionBtn} ${styles.optionCorrect}`;
                    } else if (idx === selectedAnswer) {
                      optionClass = `${styles.optionBtn} ${styles.optionIncorrect}`;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      role="radio"
                      aria-checked={selectedAnswer === idx}
                      className={optionClass}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedAnswer !== null}
                      data-testid={`quiz-opt-${idx}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && idx === currentQ.correctIndex && (
                        <CheckCircle2 size={16} color="#22c55e" />
                      )}
                      {selectedAnswer !== null &&
                        idx === selectedAnswer &&
                        idx !== currentQ.correctIndex && (
                          <XCircle size={16} color="#ef4444" />
                        )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className={styles.explanationBox} data-testid="quiz-explanation">
                  <strong>Explanation:</strong> {currentQ.explanation}
                </div>
              )}

              {selectedAnswer !== null && (
                <div className={styles.footer}>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleNext}
                    data-testid="quiz-next-btn"
                  >
                    <span>{currentIndex + 1 === total ? 'View Results' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
