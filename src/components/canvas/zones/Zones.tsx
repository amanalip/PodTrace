import React from 'react';
import { NodeProps } from '@xyflow/react';
import styles from './Zone.module.css';

export interface ZoneNodeData {
  label?: string;
  zoneType?: 'workstation' | 'cluster' | 'control-plane' | 'worker-node' | 'namespace';
}

export const WorkstationZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  return (
    <div className={`${styles.baseZone} ${styles.workstationZone}`}>
      <span className={styles.zoneLabel}>{zoneData?.label || 'Local Workstation'}</span>
    </div>
  );
};

export const ClusterZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  return (
    <div className={`${styles.baseZone} ${styles.clusterZone}`}>
      <span className={styles.zoneLabel}>{zoneData?.label || 'Kubernetes Cluster'}</span>
    </div>
  );
};

export const ControlPlaneZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  return (
    <div className={`${styles.baseZone} ${styles.controlPlaneZone}`}>
      <span className={styles.zoneLabel}>{zoneData?.label || 'Control Plane'}</span>
    </div>
  );
};

export const WorkerNodeZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  return (
    <div className={`${styles.baseZone} ${styles.workerNodeZone}`}>
      <span className={styles.zoneLabel}>{zoneData?.label || 'Worker Node 1'}</span>
    </div>
  );
};

export const NamespaceZone: React.FC<NodeProps> = ({ data }) => {
  const zoneData = data as unknown as ZoneNodeData;
  return (
    <div className={`${styles.baseZone} ${styles.namespaceZone}`}>
      <span className={styles.zoneLabel}>{zoneData?.label || 'default namespace'}</span>
    </div>
  );
};
