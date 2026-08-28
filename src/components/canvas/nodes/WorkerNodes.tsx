import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Server, Network, PlayCircle, Box, Package } from 'lucide-react';
import { DiagramNodeData } from '../../../model/types.ts';
import { BaseNode } from './BaseNode.tsx';
import styles from './Node.module.css';

export const KubeletNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'Kubelet'}
      subLabel={nodeData.subLabel || 'Node agent'}
      icon={<Server size={15} />}
      status={nodeData.status}
      accentColor="#10b981"
    />
  );
};

export const KubeProxyNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'kube-proxy'}
      subLabel={nodeData.subLabel || 'Network rules'}
      icon={<Network size={15} />}
      status={nodeData.status}
      accentColor="#14b8a6"
    />
  );
};

export const ContainerRuntimeNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'Container Runtime'}
      subLabel={nodeData.subLabel || 'CRI (containerd/CRI-O)'}
      icon={<PlayCircle size={15} />}
      status={nodeData.status}
      accentColor="#059669"
    />
  );
};

export interface PodContainerInfo {
  name: string;
  image?: string;
}

export const PodNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  const containers = (nodeData.details?.containers as PodContainerInfo[]) || [];

  return (
    <BaseNode
      label={nodeData.label || 'Pod'}
      subLabel={nodeData.subLabel || 'Workload'}
      icon={<Box size={15} />}
      status={nodeData.status}
      accentColor="#6366f1"
    >
      {containers.length > 0 && (
        <div className={styles.podContainersList}>
          {containers.map((c, i) => (
            <div key={i} className={styles.containerBadge}>
              <Package size={11} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </BaseNode>
  );
};
