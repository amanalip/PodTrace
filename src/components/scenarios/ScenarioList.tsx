import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, X } from 'lucide-react';
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
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Clear search"
            data-testid="clear-search-btn"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className={styles.categories}>
        {CATEGORIES.map((cat) => {
          const count =
            cat.value === 'all'
              ? SCENARIO_CATALOG.length
              : SCENARIO_CATALOG.filter((s) => s.category === cat.value).length;

          return (
            <button
              key={cat.value}
              type="button"
              className={`${styles.categoryPill} ${
                selectedCategory === cat.value ? styles.categoryPill_active : ''
              }`}
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedScenario(null);
              }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className={styles.scenarioCards}>
        {filteredScenarios.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="no-scenarios-found"
          >
            <p>No scenarios found matching your filter.</p>
            <button
              type="button"
              style={{
                marginTop: 4,
                padding: '5px 12px',
                borderRadius: 4,
                background: 'var(--bg-tertiary, #1e293b)',
                border: '1px solid var(--border-color, #334155)',
                color: '#38bdf8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              data-testid="reset-filters-btn"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          filteredScenarios.map((scenario) => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Active
                      </span>
                    )}
                    {isCompleted && (
                      <CheckCircle2 size={16} color="#22c55e" data-testid={`check-${scenario.id}`} />
                    )}
                  </div>
                </div>

                <div className={styles.metaTags}>
                  <span className={styles.tagCategory}>{scenario.category}</span>
                  <span>•</span>
                  <span className={difficultyClass}>{scenario.difficulty}</span>
                </div>

                <div className={styles.cardSnippet}>{scenario.description}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
