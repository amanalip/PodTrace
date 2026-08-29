import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertTriangle, RotateCcw, X, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { WHAT_IF_SCENARIOS, getWhatIfScenario } from '../../whatif/whatif-data.ts';
import { useAppStore } from '../../store/index.ts';
import styles from './WhatIfPanel.module.css';

export const WhatIfPanel: React.FC = () => {
  const { activeWhatIfId, activeWhatIf, applyWhatIf, clearWhatIf } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeWhatIfId) {
      setIsOpen(true);
    }
  }, [activeWhatIfId]);

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

  const handleCopyMitigation = () => {
    if (!activeWhatIf?.mitigation) return;
    navigator.clipboard.writeText(activeWhatIf.mitigation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={styles.panel}
      role="region"
      aria-label="What If Cluster Simulator"
      data-testid="what-if-panel"
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>What If? Cluster Simulator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand What If panel' : 'Minimize What If panel'}
            aria-expanded={!isMinimized}
            aria-controls="what-if-panel-body"
            title={isMinimized ? 'Expand simulator' : 'Minimize simulator'}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            data-testid="what-if-minimize-btn"
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close What If"
            title="Close What If simulator"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div id="what-if-panel-body" className={styles.body}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 2px 0' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  borderRadius: 4,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
                data-testid="what-if-category-badge"
              >
                {activeWhatIf.category}
              </span>
            </div>

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className={styles.sectionTitle} style={{ color: '#22c55e', margin: 0 }}>Recommended Mitigation</div>
                <button
                  type="button"
                  onClick={handleCopyMitigation}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#22c55e' : '#94a3b8',
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  data-testid="copy-mitigation-btn"
                  title="Copy mitigation"
                  aria-label="Copy mitigation"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
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
      )}
    </div>
  );
};
