import React from 'react';
import { AlignLeft } from 'lucide-react';
import styles from './YAMLEditor.module.css';

export interface FormatButtonProps {
  onFormat: () => void;
  disabled?: boolean;
}

export const FormatButton: React.FC<FormatButtonProps> = ({
  onFormat,
  disabled,
}) => {
  return (
    <button
      type="button"
      className={styles.toolButton}
      onClick={onFormat}
      disabled={disabled}
      title="Format YAML indentation"
      aria-label="Format YAML indentation"
    >
      <AlignLeft size={13} />
      <span>Format</span>
    </button>
  );
};
