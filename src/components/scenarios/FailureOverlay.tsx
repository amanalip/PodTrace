import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './FailureOverlay.module.css';

export const FailureOverlay: React.FC = () => {
  const { activeScenario, scenarioState, scenarioFeedback, resolveScenario } = useAppStore();
  const [showHint, setShowHint] = useState(false);

  if (!activeScenario || scenarioState === 'idle') {
    return null;
  }

  const isResolved = scenarioState === 'resolved' || scenarioState === 'completed';

  if (isResolved) {
    return (
      <div
        className={`${styles.overlay} ${styles.overlay_success}`}
        data-testid="scenario-success-overlay"
      >
        <div className={styles.header}>
          <div className={`${styles.badge} ${styles.badge_success}`}>
            <CheckCircle2 size={16} />
            <span>Challenge Resolved</span>
          </div>
        </div>

        <div className={styles.title}>{activeScenario.title}</div>
        <p className={styles.description}>
          {scenarioFeedback || activeScenario.successMessage}
        </p>

        {scenarioState !== 'completed' && (
          <button
            type="button"
            className={styles.completeBtn}
            onClick={resolveScenario}
            data-testid="complete-scenario-btn"
          >
            <CheckCircle2 size={14} />
            <span>Complete Challenge</span>
          </button>
        )}
      </div>
    );
  }

  const { failureDetails } = activeScenario;

  return (
    <div className={styles.overlay} data-testid="failure-overlay">
      <div className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.pulseDot} />
          <AlertTriangle size={14} />
          <span>{failureDetails.errorType}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Step {failureDetails.failingStep} Error
        </span>
      </div>

      <div className={styles.title}>{activeScenario.title}</div>
      <p className={styles.description}>{activeScenario.description}</p>

      {scenarioFeedback && (
        <div className={styles.feedback} data-testid="failure-feedback">
          {scenarioFeedback}
        </div>
      )}

      <button
        type="button"
        className={styles.hintToggle}
        onClick={() => setShowHint(!showHint)}
      >
        {showHint ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{showHint ? 'Hide Fix Hint' : 'Show Fix Hint'}</span>
      </button>

      {showHint && (
        <div className={styles.hintBox} data-testid="failure-hint">
          <strong>Hint: </strong> {failureDetails.fixHint}
        </div>
      )}
    </div>
  );
};
