import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';
import { Scenario, ScenarioCategory } from '../../scenarios/scenario-types.ts';
import { useAppStore } from '../../store/index.ts';
import { ProgressTracker } from './ProgressTracker.tsx';
import { ScenarioDetail } from './ScenarioDetail.tsx';
import styles from './ScenarioList.module.css';

const CATEGORIES: Array<{ label: string; value: ScenarioCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pod Lifecycle', value: 'pod-lifecycle' },
  { label: 'Scheduling', value: 'scheduling' },
  { label: 'Networking', value: 'networking' },
  { label: 'Storage', value: 'storage' },
  { label: 'Security', value: 'security' },
  { label: 'Scale & Update', value: 'scale-update' },
];

export const ScenarioList: React.FC = () => {
  const { activeScenarioId, completedScenarioIds } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const filteredScenarios = useMemo(() => {
    return SCENARIO_CATALOG.filter((scenario) => {
      const matchesCategory =
        selectedCategory === 'all' || scenario.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (selectedScenario) {
    return (
      <ScenarioDetail
        scenario={selectedScenario}
        onBack={() => setSelectedScenario(null)}
      />
    );
  }

  return (
    <div className={styles.container} data-testid="scenario-list">
      <ProgressTracker />

      <div className={styles.searchBar}>
        <Search size={14} color="#64748b" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`${styles.categoryPill} ${
              selectedCategory === cat.value ? styles.categoryPill_active : ''
            }`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.scenarioCards}>
        {filteredScenarios.map((scenario) => {
          const isActive = activeScenarioId === scenario.id;
          const isCompleted = completedScenarioIds.includes(scenario.id);

          const difficultyClass =
            scenario.difficulty === 'Beginner'
              ? styles.tagBeginner
              : scenario.difficulty === 'Intermediate'
                ? styles.tagIntermediate
                : styles.tagAdvanced;

          return (
            <div
              key={scenario.id}
              className={`${styles.scenarioCard} ${isActive ? styles.scenarioCard_active : ''}`}
              onClick={() => setSelectedScenario(scenario)}
              data-testid={`scenario-card-${scenario.id}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{scenario.title}</span>
                {isCompleted && (
                  <CheckCircle2 size={16} color="#22c55e" data-testid={`check-${scenario.id}`} />
                )}
              </div>

              <div className={styles.metaTags}>
                <span className={styles.tagCategory}>{scenario.category}</span>
                <span>•</span>
                <span className={difficultyClass}>{scenario.difficulty}</span>
              </div>

              <div className={styles.cardSnippet}>{scenario.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
