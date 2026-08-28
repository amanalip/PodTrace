import React, { useState } from 'react';
import { Layers, Sun, Moon, Share2, Download } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { ExportModal } from '../export/ExportModal.tsx';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
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
            onClick={() => setIsExportOpen(true)}
            aria-label="Share diagram"
            title="Share diagram"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => setIsExportOpen(true)}
            aria-label="Export diagram"
            title="Export diagram"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </header>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  );
};
