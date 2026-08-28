import React from 'react';
import { Code, BookOpen, Layers } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { YAMLEditor } from '../editor/YAMLEditor.tsx';
import { CONCEPT_CARDS } from '../../concepts/concept-data.ts';
import { ConceptCard } from '../explanation/ConceptCard.tsx';
import { ScenarioList } from '../scenarios/ScenarioList.tsx';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab } = useAppStore();

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
            {CONCEPT_CARDS.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
