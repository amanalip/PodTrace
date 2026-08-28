import React, { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { StepDetail } from './StepDetail.tsx';
import styles from './ExplanationPanel.module.css';

export const ExplanationPanel: React.FC = () => {
  const { steps, currentStepIndex } = useAppStore();
  const activeStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  if (!steps || steps.length === 0) {
    return (
      <div className={styles.emptyState} data-testid="explanation-panel-empty">
        <Info size={24} className={styles.emptyIcon} />
        <p>No active lifecycle steps.</p>
        <p>Paste a manifest or choose a sample to start tracing.</p>
      </div>
    );
  }

  return (
    <div className={styles.panelContainer} data-testid="explanation-panel">
      {steps.map((step, idx) => {
        let status: 'past' | 'current' | 'future' = 'future';
        if (idx < currentStepIndex) {
          status = 'past';
        } else if (idx === currentStepIndex) {
          status = 'current';
        }

        return (
          <StepDetail
            key={step.stepNumber}
            step={step}
            status={status}
            stepRef={status === 'current' ? activeStepRef : undefined}
          />
        );
      })}
    </div>
  );
};
