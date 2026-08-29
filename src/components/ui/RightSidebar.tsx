import React from 'react';
import { ListOrdered, Terminal } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { ExplanationPanel } from '../explanation/ExplanationPanel.tsx';
import { DiagnosticLogPanel } from '../scenarios/DiagnosticLogPanel.tsx';
import styles from './RightSidebar.module.css';

export const RightSidebar: React.FC = () => {
  const { rightPanelTab, setRightPanelTab, steps, activeScenario } = useAppStore();

  return (
    <div className={styles.rightSidebarContainer} data-testid="right-sidebar">
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={rightPanelTab === 'lifecycle'}
          className={`${styles.tabButton} ${
            rightPanelTab === 'lifecycle' ? styles.tabButton_active : ''
          }`}
          onClick={() => setRightPanelTab('lifecycle')}
        >
          <ListOrdered size={13} />
          <span>Lifecycle Trace</span>
          {steps.length > 0 && <span className={styles.badge}>{steps.length}</span>}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={rightPanelTab === 'diagnostics'}
          className={`${styles.tabButton} ${
            rightPanelTab === 'diagnostics' ? styles.tabButton_active : ''
          }`}
          onClick={() => setRightPanelTab('diagnostics')}
        >
          <Terminal size={13} />
          <span>Diagnostics</span>
          {activeScenario && <span className={styles.badgeAlert}>Live</span>}
        </button>
      </div>

      <div className={styles.tabContent}>
        {rightPanelTab === 'lifecycle' && <ExplanationPanel />}
        {rightPanelTab === 'diagnostics' && <DiagnosticLogPanel />}
      </div>
    </div>
  );
};
