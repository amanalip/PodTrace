import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeStatus } from '../../../model/types.ts';
import styles from './Node.module.css';

export interface BaseNodeProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  status?: NodeStatus;
  accentColor?: string;
  children?: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  label,
  subLabel,
  icon,
  status = 'idle',
  accentColor,
  children,
  hasInput = true,
  hasOutput = true,
}) => {
  const statusClass = styles[`status_${status}`] || styles.status_idle;

  return (
    <div
      className={styles.baseNode}
      role="group"
      aria-label={`${label} component, status: ${status}`}
      style={accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined}
      data-testid={`node-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: 'var(--border-default)', width: 8, height: 8 }}
        />
      )}

      <div
        className={`${styles.statusDot} ${statusClass}`}
        title={`Status: ${status}`}
        aria-hidden="true"
      />

      <div className={styles.nodeHeader}>
        <div className={styles.iconWrapper} style={accentColor ? { color: accentColor } : undefined}>
          {icon}
        </div>
        <div className={styles.titleArea}>
          <span className={styles.label} title={label}>
            {label}
          </span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        </div>
      </div>

      {children}

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: 'var(--border-default)', width: 8, height: 8 }}
        />
      )}
    </div>
  );
};
