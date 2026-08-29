import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code2, Download } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import {
  encodeStateToHash,
  generateMermaidSequenceDiagram,
  generateMermaidGraphDiagram,
  generateDiagramExportJSON,
  downloadFile,
} from '../../export/export-utils.ts';
import styles from './ExportModal.module.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'link' | 'mermaid' | 'svg';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'link',
}) => {
  const { yaml, currentStepIndex, theme, steps, nodes, edges } = useAppStore();
  const [activeTab, setActiveTab] = useState<'link' | 'mermaid' | 'svg'>(initialTab);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hash = encodeStateToHash(yaml, currentStepIndex, theme);
  const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;

  const mermaidSequence = generateMermaidSequenceDiagram(steps);
  const mermaidGraph = generateMermaidGraphDiagram(nodes, edges);

  const handleCopy = (text: string, targetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(targetId);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  const handleDownloadMermaid = (content: string, filename: string) => {
    downloadFile(content, filename, 'text/markdown');
  };

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="export-modal-overlay">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Export and Share Diagram"
        data-testid="export-modal"
      >
        <div className={styles.header}>
          <div className={styles.title}>Export & Share Diagram</div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Export Modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'link' ? styles.tabBtn_active : ''}`}
              onClick={() => setActiveTab('link')}
            >
              <Share2 size={12} style={{ display: 'inline', marginRight: 4 }} />
              Shareable Link
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'mermaid' ? styles.tabBtn_active : ''}`}
              onClick={() => setActiveTab('mermaid')}
            >
              <Code2 size={12} style={{ display: 'inline', marginRight: 4 }} />
              Mermaid Markdown
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'svg' ? styles.tabBtn_active : ''}`}
              onClick={() => setActiveTab('svg')}
            >
              <Download size={12} style={{ display: 'inline', marginRight: 4 }} />
              Vector / Image
            </button>
          </div>

          {activeTab === 'link' && (
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Direct URL to current diagram and step:</span>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className={styles.input}
                  data-testid="share-url-input"
                />
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => handleCopy(shareUrl, 'link')}
                  data-testid="copy-link-btn"
                >
                  {copiedTarget === 'link' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedTarget === 'link' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className={styles.infoText}>
                Encodes the current YAML editor content, animation step, and theme directly into the URL hash.
              </span>
            </div>
          )}

          {activeTab === 'mermaid' && (
            <div className={styles.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.label}>Mermaid Sequence Diagram:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className={styles.btnAction}
                    onClick={() => handleCopy(mermaidSequence, 'mermaid-seq')}
                    data-testid="copy-mermaid-btn"
                  >
                    {copiedTarget === 'mermaid-seq' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedTarget === 'mermaid-seq' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnAction}
                    style={{ background: '#334155' }}
                    onClick={() => handleDownloadMermaid(mermaidSequence, 'podtrace-sequence.mmd')}
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                className={styles.codeArea}
                value={mermaidSequence}
                data-testid="mermaid-sequence-area"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span className={styles.label}>Mermaid Architecture Topology:</span>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => handleCopy(mermaidGraph, 'mermaid-graph')}
                >
                  {copiedTarget === 'mermaid-graph' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedTarget === 'mermaid-graph' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                readOnly
                className={styles.codeArea}
                value={mermaidGraph}
                data-testid="mermaid-graph-area"
              />
            </div>
          )}

          {activeTab === 'svg' && (
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Export Raw Architecture & Lifecycle Data</span>
              <p className={styles.infoText}>
                Download structural layout, topology descriptions, and JSON trace data for documentation or incident analysis.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => handleDownloadMermaid(mermaidGraph, 'podtrace-topology.mmd')}
                  data-testid="download-topology-btn"
                >
                  <Download size={14} />
                  <span>Download Architecture (.mmd)</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  style={{ background: '#334155' }}
                  onClick={() => handleDownloadMermaid(mermaidSequence, 'podtrace-lifecycle.mmd')}
                  data-testid="download-lifecycle-btn"
                >
                  <Download size={14} />
                  <span>Download Lifecycle (.mmd)</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  style={{ background: '#1e293b' }}
                  onClick={() => {
                    const json = generateDiagramExportJSON(yaml, currentStepIndex, steps, nodes, edges);
                    downloadFile(json, 'podtrace-diagram.json', 'application/json');
                  }}
                  data-testid="download-json-btn"
                >
                  <Download size={14} />
                  <span>Download Trace (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
