import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './KeyboardShortcutsModal.module.css';

const SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause lifecycle animation' },
  { key: 'ArrowRight', description: 'Step forward to next lifecycle event' },
  { key: 'ArrowLeft', description: 'Step backward to previous lifecycle event' },
  { key: 'Home', description: 'Jump to first step' },
  { key: 'End', description: 'Jump to final step' },
  { key: 'Escape', description: 'Close active drawer, modal, or What-If simulation' },
  { key: '?', description: 'Toggle this keyboard shortcuts dialog' },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useAppStore();

  if (!isShortcutsOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => setIsShortcutsOpen(false)}
      data-testid="shortcuts-modal-overlay"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        data-testid="shortcuts-modal"
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <Keyboard size={16} color="#38bdf8" />
            <div className={styles.title}>Keyboard Shortcuts</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsShortcutsOpen(false)}
            aria-label="Close shortcuts dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {SHORTCUTS.map((s, idx) => (
            <div key={idx} className={styles.shortcutRow}>
              <span className={styles.shortcutLabel}>{s.description}</span>
              <kbd className={styles.keyCap}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
