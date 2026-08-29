import React, { useState } from 'react';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, Code, Copy, Check } from 'lucide-react';
import { Scenario } from '../../scenarios/scenario-types.ts';
import { useAppStore } from '../../store/index.ts';
import styles from './ScenarioDetail.module.css';

interface ScenarioDetailProps {
  scenario: Scenario;
  onBack: () => void;
}

export const ScenarioDetail: React.FC<ScenarioDetailProps> = ({ scenario, onBack }) => {
  const {
    activeScenarioId,
    scenarioState,
    completedScenarioIds,
    loadScenario,
    resetScenario,
    setActiveSidebarTab,
  } = useAppStore();

  const [showYaml, setShowYaml] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCurrentActive = activeScenarioId === scenario.id;
  const isCompleted = completedScenarioIds.includes(scenario.id);

  const difficultyClass =
    scenario.difficulty === 'Beginner'
      ? styles.badgeBeginner
      : scenario.difficulty === 'Intermediate'
        ? styles.badgeIntermediate
        : styles.badgeAdvanced;

  const estTime =
    scenario.difficulty === 'Beginner'
      ? '~2-3 mins'
      : scenario.difficulty === 'Intermediate'
        ? '~3-5 mins'
        : '~5-8 mins';

  const handleStart = () => {
    loadScenario(scenario);
    setActiveSidebarTab('editor');
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(scenario.yamlTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card} data-testid="scenario-detail">
      <button
        type="button"
        className={styles.backBtn}
        onClick={onBack}
        aria-label="Back to scenario list"
        data-testid="back-to-scenarios-btn"
      >
        <ArrowLeft size={14} />
        <span>Back to scenarios</span>
      </button>

      <div className={styles.header}>
        <div className={styles.title}>{scenario.title}</div>
        {isCompleted && (
          <CheckCircle2 size={18} color="#22c55e" data-testid="completed-badge" />
        )}
      </div>

      <div className={styles.metaRow}>
        <span className={styles.badgeCategory}>{scenario.category}</span>
        <span className={difficultyClass}>{scenario.difficulty}</span>
        <span className={styles.badgeCategory}>{estTime}</span>
      </div>

      <div className={styles.description}>{scenario.description}</div>

      <div className={styles.explanationBox}>
        <strong>Failure Context:</strong> {scenario.explanation}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setShowYaml(!showYaml)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '6px 8px',
            background: 'var(--bg-tertiary, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: 6,
            color: 'var(--text-secondary, #94a3b8)',
            fontSize: 12,
            cursor: 'pointer',
          }}
          data-testid="toggle-scenario-yaml-btn"
          aria-expanded={showYaml}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Code size={13} color="#38bdf8" />
            <span>Starting Manifest</span>
          </span>
          {showYaml ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showYaml && (
          <div
            style={{
              marginTop: 6,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: 8,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <button
                type="button"
                onClick={handleCopyYaml}
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
                data-testid="copy-scenario-yaml-btn"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#e2e8f0',
                overflowX: 'auto',
                lineHeight: 1.4,
              }}
            >
              {scenario.yamlTemplate}
            </pre>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleStart}
          data-testid="start-scenario-btn"
        >
          <Play size={14} />
          <span>{isCurrentActive ? 'Restart Scenario' : 'Start Scenario'}</span>
        </button>

        {isCurrentActive && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setActiveSidebarTab('editor')}
            data-testid="go-to-editor-btn"
          >
            <span>Edit Manifest</span>
          </button>
        )}

        {isCurrentActive && scenarioState !== 'idle' && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={resetScenario}
            data-testid="reset-scenario-btn"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
