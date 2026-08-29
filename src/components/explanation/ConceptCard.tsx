import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ExternalLink, Copy, Check } from 'lucide-react';
import { ConceptCardData } from '../../model/types.ts';
import styles from './ConceptCard.module.css';

export interface ConceptCardProps {
  concept: ConceptCardData;
  initiallyOpen?: boolean;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsOpen(initiallyOpen);
  }, [initiallyOpen]);

  const handleCopyKeyFact = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(concept.keyFact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card} data-testid={`concept-card-${concept.id}`}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.title}>{concept.title}</span>
        <span className={styles.toggleIcon}>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {isOpen && (
        <div className={styles.cardBody}>
          <p className={styles.definition}>{concept.definition}</p>
          <div className={styles.keyFact}>
            <Sparkles size={13} className={styles.keyFactIcon} />
            <span style={{ flex: 1 }}>{concept.keyFact}</span>
            <button
              type="button"
              onClick={handleCopyKeyFact}
              title="Copy key fact"
              aria-label="Copy key fact"
              style={{
                background: 'none',
                border: 'none',
                color: copied ? '#22c55e' : '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              data-testid={`copy-keyfact-${concept.id}`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          {concept.docsUrl && (
            <a
              href={concept.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docsLink}
              onClick={(e) => e.stopPropagation()}
            >
              <span>Kubernetes Documentation</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
