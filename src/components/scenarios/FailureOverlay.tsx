import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './FailureOverlay.module.css';

export const FailureOverlay: React.FC = () => {
  const {
    activeScenario,
    scenarioState,
    scenarioFeedback,
    resolveScenario,
    setScenarioState,
  } = useAppStore();
  const [showHint, setShowHint] = useState(false);

  if (!activeScenario || scenarioState === 'idle') {
    return null;
  }

  const isResolved = scenarioState === 'resolved' || scenarioState === 'completed';

  if (isResolved) {
    return (
      <div
        className={`${styles.overlay} ${styles.overlay_success}`}
        role="region"
        aria-label="Scenario Resolution Banner"
        data-testid="scenario-success-overlay"
      >
        <div className={styles.header}>
          <div className={`${styles.badge} ${styles.badge_success}`}>
            <CheckCircle2 size={16} />
            <span>Challenge Resolved</span>
          </div>
          {scenarioState === 'completed' && (
            <button
              type="button"
              onClick={() => setScenarioState('idle')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 12,
              }}
              title="Dismiss completion banner"
              aria-label="Dismiss completion banner"
              data-testid="dismiss-overlay-x"
            >
              Dismiss
            </button>
          )}
        </div>

        <div className={styles.title}>{activeScenario.title}</div>
        <p className={styles.description}>
          {scenarioFeedback || activeScenario.successMessage}
        </p>

        {scenarioState !== 'completed' ? (
          <button
            type="button"
            className={styles.completeBtn}
            onClick={resolveScenario}
            data-testid="complete-scenario-btn"
          >
            <CheckCircle2 size={14} />
            <span>Complete Challenge</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.completeBtn}
            onClick={() => setScenarioState('idle')}
            data-testid="dismiss-success-overlay-btn"
          >
            <span>Close Banner & View Diagram</span>
          </button>
        )}
      </div>
    );
  }

  const { failureDetails } = activeScenario;

  return (
    <div
      className={styles.overlay}
      role="region"
      aria-label="Scenario Failure Details"
      data-testid="failure-overlay"
    >
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
        aria-expanded={showHint}
        aria-controls="failure-hint-box"
        data-testid="toggle-hint-btn"
      >
        {showHint ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{showHint ? 'Hide Fix Hint' : 'Show Fix Hint'}</span>
      </button>

      {showHint && (
        <div id="failure-hint-box" className={styles.hintBox} data-testid="failure-hint">
          <strong>Hint: </strong> {failureDetails.fixHint}
        </div>
      )}
    </div>
  );
};
