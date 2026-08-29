import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './ValidationPanel.module.css';

export const ValidationPanel: React.FC = () => {
  const { validationErrors } = useAppStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (!validationErrors || validationErrors.length === 0) {
    return null;
  }

  return (
    <div className={styles.errorContainer} data-testid="validation-panel" role="alert">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand validation issues' : 'Collapse validation issues'}
        className={styles.errorHeader}
        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} />
          <span>Validation Issues ({validationErrors.length})</span>
        </div>
        <span
          style={{
            color: 'var(--status-error)',
            fontSize: 11,
          }}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </span>
      </div>
      {!isCollapsed && (
        <ul className={styles.errorList}>
          {validationErrors.map((err, index) => (
            <li
              key={index}
              className={styles.errorItem}
              data-testid={`validation-error-${index}`}
            >
              {err.line && <span className={styles.lineBadge}>L{err.line}</span>}
              <span className={styles.errorMessage}>{err.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
