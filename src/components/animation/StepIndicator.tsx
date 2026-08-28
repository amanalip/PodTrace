import React from 'react';
import { useAppStore } from '../../store/index.ts';
import styles from './StepIndicator.module.css';

export const StepIndicator: React.FC = () => {
  const { steps, currentStepIndex, setCurrentStepIndex } = useAppStore();

  if (!steps || steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className={styles.stepIndicator} data-testid="step-indicator">
      <div className={styles.stepText}>
        <span>
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        {currentStep && <span className={styles.stepTitle}>{currentStep.title}</span>}
      </div>

      <div className={styles.progressBar} role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        {steps.map((s, idx) => {
          let segmentClass = styles.stepSegment;
          if (idx < currentStepIndex) {
            segmentClass = `${styles.stepSegment} ${styles.stepSegment_completed}`;
          } else if (idx === currentStepIndex) {
            segmentClass = `${styles.stepSegment} ${styles.stepSegment_current}`;
          }

          return (
            <button
              key={s.stepNumber}
              type="button"
              className={segmentClass}
              onClick={() => setCurrentStepIndex(idx)}
              title={`Jump to Step ${idx + 1}: ${s.title}`}
              aria-label={`Jump to Step ${idx + 1}: ${s.title}`}
            />
          );
        })}
      </div>
    </div>
  );
};
