import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';
import { EdgeStatus } from '../../../model/types.ts';
import styles from './FlowEdge.module.css';

export interface FlowEdgeData {
  label?: string;
  status?: EdgeStatus;
}

export const FlowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const edgeData = data as unknown as FlowEdgeData;
  const status: EdgeStatus = edgeData?.status || 'inactive';
  const label = edgeData?.label;

  let strokeColor = '#475569';
  let strokeDasharray = '5 5';
  let strokeWidth = 1.5;

  if (status === 'active') {
    strokeColor = '#38bdf8';
    strokeDasharray = 'none';
    strokeWidth = 2.5;
  } else if (status === 'complete') {
    strokeColor = '#22c55e';
    strokeDasharray = 'none';
    strokeWidth = 2;
  } else if (status === 'error') {
    strokeColor = '#ef4444';
    strokeDasharray = 'none';
    strokeWidth = 2.5;
  } else if (status === 'warning') {
    strokeColor = '#f59e0b';
    strokeDasharray = 'none';
    strokeWidth = 2;
  }

  const labelClass =
    status === 'active'
      ? styles.edgeLabel_active
      : status === 'complete'
        ? styles.edgeLabel_complete
        : status === 'error'
          ? styles.edgeLabel_error
          : status === 'warning'
            ? styles.edgeLabel_warning
            : '';

  const packetColor =
    status === 'active'
      ? '#38bdf8'
      : status === 'error'
        ? '#ef4444'
        : status === 'warning'
          ? '#f59e0b'
          : null;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeDasharray,
          strokeWidth,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />

      {packetColor && (
        <circle r="4" fill={packetColor}>
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`${styles.edgeLabel} ${labelClass}`}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
