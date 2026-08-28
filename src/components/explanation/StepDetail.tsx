import React from 'react';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { LifecycleStep } from '../../model/types.ts';
import styles from './StepDetail.module.css';

export interface StepDetailProps {
  step: LifecycleStep;
  status: 'past' | 'current' | 'future';
  stepRef?: React.RefObject<HTMLDivElement | null>;
}

export const StepDetail: React.FC<StepDetailProps> = ({
  step,
  status,
  stepRef,
}) => {
  const cardClass =
    status === 'current'
      ? styles.stepCard_current
      : status === 'past'
        ? styles.stepCard_past
        : styles.stepCard_future;

  return (
    <div
      ref={stepRef}
      className={`${styles.stepCard} ${cardClass}`}
      data-testid={`step-detail-${step.stepNumber}`}
    >
      <div className={styles.cardHeader}>
        <span
          className={`${styles.stepBadge} ${status === 'past' ? styles.stepBadge_completed : ''}`}
        >
          {status === 'past' ? (
            <>
              <CheckCircle size={12} />
              <span>Step {step.stepNumber}</span>
            </>
          ) : status === 'current' ? (
            <>
              <Clock size={12} />
              <span>Step {step.stepNumber} (Active)</span>
            </>
          ) : (
            <span>Step {step.stepNumber}</span>
          )}
        </span>
      </div>

      <div className={styles.stepTitle}>{step.title}</div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>What Happens</span>
        <p className={styles.sectionContent}>{step.what}</p>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Why It Matters</span>
        <p className={styles.sectionContent}>{step.why}</p>
      </div>

      <div className={styles.componentSpotlight}>
        <div className={styles.componentHeader}>
          <span className={styles.componentName}>{step.componentName}</span>
          {step.docsUrl && (
            <a
              href={step.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docsLink}
              title="Official Kubernetes documentation"
            >
              <span>Docs</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className={styles.componentRole}>{step.componentRole}</div>
      </div>
    </div>
  );
};
