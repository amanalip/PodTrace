import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './ValidationPanel.module.css';

export const ValidationPanel: React.FC = () => {
  const { validationErrors } = useAppStore();

  if (!validationErrors || validationErrors.length === 0) {
    return null;
  }

  return (
    <div className={styles.errorContainer} data-testid="validation-panel" role="alert">
      <div className={styles.errorHeader}>
        <AlertCircle size={14} />
        <span>Validation Issues ({validationErrors.length})</span>
      </div>
      <ul className={styles.errorList}>
        {validationErrors.map((err, index) => (
          <li key={index} className={styles.errorItem}>
            {err.line && <span className={styles.lineBadge}>L{err.line}</span>}
            <span className={styles.errorMessage}>{err.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
