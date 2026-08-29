import React from 'react';
import { NodeProps } from '@xyflow/react';
import styles from './Zone.module.css';

export interface ZoneNodeData {
  label?: string;
  zoneType?: 'workstation' | 'cluster' | 'control-plane' | 'worker-node' | 'namespace';
}

export const WorkstationZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  const label = zoneData?.label || 'Local Workstation';
  return (
    <div
      className={`${styles.baseZone} ${styles.workstationZone}`}
      role="group"
      aria-label={`Boundary: ${label}`}
    >
      <span className={styles.zoneLabel}>{label}</span>
    </div>
  );
};

export const ClusterZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  const label = zoneData?.label || 'Kubernetes Cluster';
  return (
    <div
      className={`${styles.baseZone} ${styles.clusterZone}`}
      role="group"
      aria-label={`Boundary: ${label}`}
    >
      <span className={styles.zoneLabel}>{label}</span>
    </div>
  );
};

export const ControlPlaneZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  const label = zoneData?.label || 'Control Plane';
  return (
    <div
      className={`${styles.baseZone} ${styles.controlPlaneZone}`}
      role="group"
      aria-label={`Boundary: ${label}`}
    >
      <span className={styles.zoneLabel}>{label}</span>
    </div>
  );
};

export const WorkerNodeZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  const label = zoneData?.label || 'Worker Node 1';
  return (
    <div
      className={`${styles.baseZone} ${styles.workerNodeZone}`}
      role="group"
      aria-label={`Boundary: ${label}`}
    >
      <span className={styles.zoneLabel}>{label}</span>
    </div>
  );
};

export const NamespaceZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  const label = zoneData?.label || 'default namespace';
  return (
    <div
      className={`${styles.baseZone} ${styles.namespaceZone}`}
      role="group"
      aria-label={`Boundary: ${label}`}
    >
      <span className={styles.zoneLabel}>{label}</span>
    </div>
  );
};
