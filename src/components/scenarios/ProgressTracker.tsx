import React from 'react';
import { useAppStore } from '../../store/index.ts';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';
import styles from './ProgressTracker.module.css';

export const ProgressTracker: React.FC = () => {
  const { completedScenarioIds } = useAppStore();
  const total = SCENARIO_CATALOG.length;
  const completed = completedScenarioIds.length;
  const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((completed / total) * 100))) : 0;

  return (
    <div className={styles.container} data-testid="progress-tracker">
      <div className={styles.header}>
        <span>Troubleshooting Progress</span>
        <span className={styles.stats}>
          {completed}/{total} ({percentage}%)
        </span>
      </div>
      <div className={styles.progressBarBg}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
};
