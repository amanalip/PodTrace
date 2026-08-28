import React from 'react';
import { ArrowLeft, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
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
  } = useAppStore();

  const isCurrentActive = activeScenarioId === scenario.id;
  const isCompleted = completedScenarioIds.includes(scenario.id);

  const difficultyClass =
    scenario.difficulty === 'Beginner'
      ? styles.badgeBeginner
      : scenario.difficulty === 'Intermediate'
        ? styles.badgeIntermediate
        : styles.badgeAdvanced;

  return (
    <div className={styles.card} data-testid="scenario-detail">
      <button type="button" className={styles.backBtn} onClick={onBack}>
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
      </div>

      <div className={styles.description}>{scenario.description}</div>

      <div className={styles.explanationBox}>
        <strong>Failure Context:</strong> {scenario.explanation}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => loadScenario(scenario)}
        >
          <Play size={14} />
          <span>{isCurrentActive ? 'Restart Scenario' : 'Start Scenario'}</span>
        </button>

        {isCurrentActive && scenarioState !== 'idle' && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={resetScenario}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
