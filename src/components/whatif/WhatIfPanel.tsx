import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, RotateCcw, X } from 'lucide-react';
import { WHAT_IF_SCENARIOS, getWhatIfScenario } from '../../whatif/whatif-data.ts';
import { useAppStore } from '../../store/index.ts';
import styles from './WhatIfPanel.module.css';

export const WhatIfPanel: React.FC = () => {
  const { activeWhatIfId, activeWhatIf, applyWhatIf, clearWhatIf } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen && !activeWhatIfId) {
    return (
      <button
        type="button"
        className={styles.launcherBtn}
        onClick={() => setIsOpen(true)}
        data-testid="what-if-launcher"
      >
        <HelpCircle size={14} color="#f59e0b" />
        <span>What If? Mode</span>
      </button>
    );
  }

  const handleSelectScenario = (scenarioId: string) => {
    if (!scenarioId) {
      clearWhatIf();
      return;
    }
    const scenario = getWhatIfScenario(scenarioId);
    if (scenario) {
      applyWhatIf(scenario);
    }
  };

  const handleClose = () => {
    clearWhatIf();
    setIsOpen(false);
  };

  return (
    <div className={styles.panel} data-testid="what-if-panel">
      <div className={styles.header}>
        <div className={styles.title}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>What If? Cluster Simulator</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close What If"
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        <div>
          <label htmlFor="what-if-select" style={{ display: 'block', marginBottom: 4, color: '#94a3b8', fontSize: 11 }}>
            Select Failure Scenario:
          </label>
          <select
            id="what-if-select"
            className={styles.select}
            value={activeWhatIfId || ''}
            onChange={(e) => handleSelectScenario(e.target.value)}
            data-testid="what-if-select"
          >
            <option value="">-- Choose scenario --</option>
            {WHAT_IF_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {activeWhatIf && (
          <>
            <div className={styles.description}>{activeWhatIf.description}</div>

            <div>
              <div className={styles.sectionTitle}>Cluster Consequences</div>
              <ul className={styles.consequencesList}>
                {activeWhatIf.consequences.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className={styles.sectionTitle} style={{ color: '#22c55e' }}>Recommended Mitigation</div>
              <div className={styles.mitigationBox}>{activeWhatIf.mitigation}</div>
            </div>

            <button
              type="button"
              className={styles.restoreBtn}
              onClick={clearWhatIf}
              data-testid="restore-health-btn"
            >
              <RotateCcw size={12} />
              <span>Restore Cluster Health</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
