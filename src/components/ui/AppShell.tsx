import React, { useEffect } from 'react';
import { useAppStore } from '../../store/index.ts';
import { Header } from './Header.tsx';
import styles from './AppShell.module.css';

export interface AppShellProps {
  editorSlot?: React.ReactNode;
  canvasSlot?: React.ReactNode;
  explanationSlot?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  editorSlot,
  canvasSlot,
  explanationSlot,
}) => {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.mainLayout}>
        <aside className={styles.leftPanel} aria-label="YAML Editor and Scenarios">
          {editorSlot || (
            <div className={styles.panelContent}>
              <div className={styles.placeholderCard}>
                YAML editor will render here.
              </div>
            </div>
          )}
        </aside>

        <main className={styles.centerPanel} aria-label="Kubernetes Architecture Diagram">
          {canvasSlot || (
            <div className={styles.panelContent}>
              <div className={styles.placeholderCard}>
                Architecture diagram canvas will render here.
              </div>
            </div>
          )}
        </main>

        <aside className={styles.rightPanel} aria-label="Lifecycle Explanation and Diagnostics">
          {explanationSlot || (
            <div className={styles.panelContent}>
              <div className={styles.placeholderCard}>
                Step-by-step lifecycle explanations and diagnostic logs will appear here.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
