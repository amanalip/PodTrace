import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './KeyboardShortcutsModal.module.css';

const SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause lifecycle animation' },
  { key: 'ArrowRight', description: 'Step forward to next lifecycle event' },
  { key: 'ArrowLeft', description: 'Step backward to previous lifecycle event' },
  { key: 'R', description: 'Reset animation to first step' },
  { key: '[ / ]', description: 'Decrease / Increase playback speed' },
  { key: 'Home', description: 'Jump to first step' },
  { key: 'End', description: 'Jump to final step' },
  { key: 'Escape', description: 'Close active drawer, modal, or What-If simulation' },
  { key: '?', description: 'Toggle this keyboard shortcuts dialog' },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isShortcutsOpen && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [isShortcutsOpen]);

  useEffect(() => {
    if (!isShortcutsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen, setIsShortcutsOpen]);

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return SHORTCUTS;
    const q = searchQuery.toLowerCase();
    return SHORTCUTS.filter(
      (s) => s.key.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

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
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        data-testid="shortcuts-modal"
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <Keyboard size={16} color="#38bdf8" />
            <div className={styles.title}>Keyboard Shortcuts</div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsShortcutsOpen(false)}
            aria-label="Close shortcuts dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '8px 16px 0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-tertiary, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            <Search size={12} color="#64748b" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter shortcuts..."
              aria-label="Filter keyboard shortcuts"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
              data-testid="shortcuts-filter-input"
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
                }}
                aria-label="Clear shortcut filter"
                data-testid="clear-shortcuts-filter-btn"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.body}>
          {filteredShortcuts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '16px 0', fontSize: 12 }}>
              No shortcuts found matching "{searchQuery}".
            </div>
          ) : (
            filteredShortcuts.map((s, idx) => (
              <div key={idx} className={styles.shortcutRow} aria-label={`${s.key}: ${s.description}`}>
                <span className={styles.shortcutLabel}>{s.description}</span>
                <kbd className={styles.keyCap}>{s.key}</kbd>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
