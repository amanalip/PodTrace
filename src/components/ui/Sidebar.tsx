import React from 'react';
import { Code, BookOpen, Layers, X } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { YAMLEditor } from '../editor/YAMLEditor.tsx';
import { CONCEPT_CARDS } from '../../concepts/concept-data.ts';
import { ConceptCard } from '../explanation/ConceptCard.tsx';
import { ScenarioList } from '../scenarios/ScenarioList.tsx';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab } = useAppStore();
  const [conceptSearch, setConceptSearch] = React.useState('');

  const filteredConcepts = React.useMemo(() => {
    if (!conceptSearch.trim()) return CONCEPT_CARDS;
    const q = conceptSearch.toLowerCase();
    return CONCEPT_CARDS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        c.keyFact.toLowerCase().includes(q),
    );
  }, [conceptSearch]);

  return (
    <div className={styles.sidebarContainer} data-testid="sidebar-container">
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSidebarTab === 'editor'}
          className={`${styles.tabButton} ${activeSidebarTab === 'editor' ? styles.tabButton_active : ''}`}
          onClick={() => setActiveSidebarTab('editor')}
        >
          <Code size={13} />
          <span>Editor</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSidebarTab === 'scenarios'}
          className={`${styles.tabButton} ${activeSidebarTab === 'scenarios' ? styles.tabButton_active : ''}`}
          onClick={() => setActiveSidebarTab('scenarios')}
        >
          <Layers size={13} />
          <span>Scenarios</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSidebarTab === 'concepts'}
          className={`${styles.tabButton} ${activeSidebarTab === 'concepts' ? styles.tabButton_active : ''}`}
          onClick={() => setActiveSidebarTab('concepts')}
        >
          <BookOpen size={13} />
          <span>Concepts</span>
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeSidebarTab === 'editor' && <YAMLEditor />}

        {activeSidebarTab === 'scenarios' && (
          <div style={{ padding: 16 }}>
            <ScenarioList />
          </div>
        )}

        {activeSidebarTab === 'concepts' && (
          <div className={styles.conceptsList} data-testid="concepts-list">
            <div style={{ padding: '4px 0 12px 0', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search Kubernetes concepts..."
                value={conceptSearch}
                onChange={(e) => setConceptSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 28px 6px 10px',
                  background: 'var(--bg-tertiary, #0f172a)',
                  border: '1px solid var(--border-color, #334155)',
                  borderRadius: 6,
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: 12,
                  outline: 'none',
                }}
                data-testid="concept-search-input"
              />
              {conceptSearch && (
                <button
                  type="button"
                  onClick={() => setConceptSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Clear concept search"
                  data-testid="clear-concept-search-btn"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {filteredConcepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
