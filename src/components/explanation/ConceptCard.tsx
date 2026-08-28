import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ExternalLink } from 'lucide-react';
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
            <span>{concept.keyFact}</span>
          </div>
          {concept.docsUrl && (
            <a
              href={concept.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docsLink}
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
