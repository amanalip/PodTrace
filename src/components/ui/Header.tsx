import React, { useState } from 'react';
import { Layers, Sun, Moon, Share2, Download, Award, Keyboard, Code2 } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { ExportModal } from '../export/ExportModal.tsx';
import { QuizModal } from '../quiz/QuizModal.tsx';
import { KeyboardShortcutsModal } from '../shortcuts/KeyboardShortcutsModal.tsx';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme, setIsShortcutsOpen } = useAppStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'link' | 'mermaid' | 'svg'>('link');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleOpenShare = () => {
    setExportTab('link');
    setIsExportOpen(true);
  };

  const handleOpenExport = () => {
    setExportTab('svg');
    setIsExportOpen(true);
  };

  return (
    <>
      <header className={styles.header} aria-label="PodTrace Application Header">
        <div className={styles.brand}>
          <div className={styles.logoIcon} aria-hidden="true">
            <Layers size={20} />
          </div>
          <span className={styles.title}>PodTrace</span>
          <span className={styles.tagline}>Trace every step, from apply to running</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => setIsShortcutsOpen(true)}
            aria-label="View keyboard shortcuts"
            title="Keyboard Shortcuts (?)"
            data-testid="shortcuts-launcher-btn"
          >
            <Keyboard size={14} />
            <span>Keys</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => setIsQuizOpen(true)}
            aria-label="Take Quiz"
            title="Kubernetes Quiz"
            data-testid="quiz-launcher-btn"
          >
            <Award size={14} color="#38bdf8" />
            <span>Quiz</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={handleOpenShare}
            aria-label="Share diagram"
            title="Share diagram"
            data-testid="header-share-btn"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={handleOpenExport}
            aria-label="Export diagram"
            title="Export diagram"
            data-testid="header-export-btn"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <a
            href="https://github.com/amanap/PodTrace"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            aria-label="View PodTrace source code on GitHub"
            title="GitHub Repository"
            data-testid="header-github-link"
          >
            <Code2 size={14} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        initialTab={exportTab}
      />
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <KeyboardShortcutsModal />
    </>
  );
};
