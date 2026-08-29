import React, { useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './DiagramLegend.module.css';

export const DiagramLegend: React.FC = () => {
  const { isLegendOpen, setIsLegendOpen } = useAppStore();

  useEffect(() => {
    if (!isLegendOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLegendOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLegendOpen, setIsLegendOpen]);

  return (
    <div className={styles.legendContainer} data-testid="diagram-legend">
      <button
        type="button"
        className={styles.legendToggle}
        onClick={() => setIsLegendOpen(!isLegendOpen)}
        aria-label={isLegendOpen ? 'Close diagram legend' : 'Open diagram legend'}
        aria-expanded={isLegendOpen}
        aria-controls="diagram-legend-card"
        title="Toggle canvas legend"
        data-testid="diagram-legend-toggle-btn"
      >
        {isLegendOpen ? <X size={14} /> : <HelpCircle size={14} />}
        <span>Legend</span>
      </button>

      {isLegendOpen && (
        <div
          id="diagram-legend-card"
          className={styles.legendCard}
          role="region"
          aria-label="Diagram Status and Boundary Legend"
        >
          <div>
            <div className={styles.sectionTitle}>Node Status</div>
            <div className={styles.itemsList}>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#64748b' }} aria-hidden="true" />
                <span>Idle (waiting)</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#38bdf8' }} aria-hidden="true" />
                <span>Active (processing step)</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#22c55e' }} aria-hidden="true" />
                <span>Success / Running</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#f59e0b' }} aria-hidden="true" />
                <span>Pending / Warning</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#ef4444' }} aria-hidden="true" />
                <span>Error / Failed</span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Edge Status</div>
            <div className={styles.itemsList}>
              <div className={styles.itemRow}>
                <div className={`${styles.edgeSample} ${styles.edge_inactive}`} aria-hidden="true" />
                <span>Inactive flow</span>
              </div>
              <div className={styles.itemRow}>
                <div className={`${styles.edgeSample} ${styles.edge_active}`} aria-hidden="true" />
                <span>Active message flow</span>
              </div>
              <div className={styles.itemRow}>
                <div className={`${styles.edgeSample} ${styles.edge_complete}`} aria-hidden="true" />
                <span>Completed action</span>
              </div>
              <div className={styles.itemRow}>
                <div className={`${styles.edgeSample} ${styles.edge_error}`} aria-hidden="true" />
                <span>Error / Failed flow</span>
              </div>
              <div className={styles.itemRow}>
                <div className={`${styles.edgeSample} ${styles.edge_warning}`} aria-hidden="true" />
                <span>Warning / Pending flow</span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Zone Boundaries</div>
            <div className={styles.itemsList}>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#475569' }} aria-hidden="true" />
                <span>Local Workstation</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#3b82f6' }} aria-hidden="true" />
                <span>Control Plane</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#10b981' }} aria-hidden="true" />
                <span>Worker Node</span>
              </div>
              <div className={styles.itemRow}>
                <div className={styles.colorDot} style={{ backgroundColor: '#f59e0b' }} aria-hidden="true" />
                <span>Namespace Scope</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
