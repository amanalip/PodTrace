import React from 'react';
import { useAppStore } from '../../store/index.ts';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';
import styles from './ProgressTracker.module.css';

export const ProgressTracker: React.FC = () => {
  const { completedScenarioIds } = useAppStore();
  const total = SCENARIO_CATALOG.length;
  const completed = completedScenarioIds.length;
  const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((completed / total) * 100))) : 0;

  const isAllSolved = completed === total && total > 0;

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Troubleshooting Scenario Progress"
      data-testid="progress-tracker"
    >
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Troubleshooting Progress</span>
          {isAllSolved && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.15)',
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
              data-testid="all-solved-badge"
            >
              All Solved!
            </span>
          )}
        </div>
        <span className={styles.stats}>
          {completed}/{total} ({percentage}%)
        </span>
      </div>
      <div
        className={styles.progressBarBg}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} of ${total} scenarios solved, ${percentage} percent complete`}
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
};
