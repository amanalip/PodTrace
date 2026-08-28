import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Cpu, Database, CalendarCheck, Sliders } from 'lucide-react';
import { DiagramNodeData } from '../../../model/types.ts';
import { BaseNode } from './BaseNode.tsx';

export const APIServerNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'API Server'}
      subLabel={nodeData.subLabel || 'kube-apiserver'}
      icon={<Cpu size={15} />}
      status={nodeData.status}
      accentColor="#3b82f6"
    />
  );
};

export const ETCDNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'etcd'}
      subLabel={nodeData.subLabel || 'Cluster store'}
      icon={<Database size={15} />}
      status={nodeData.status}
      accentColor="#06b6d4"
    />
  );
};

export const SchedulerNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'Scheduler'}
      subLabel={nodeData.subLabel || 'kube-scheduler'}
      icon={<CalendarCheck size={15} />}
      status={nodeData.status}
      accentColor="#8b5cf6"
    />
  );
};

export const ControllerManagerNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'Controller Mgr'}
      subLabel={nodeData.subLabel || 'kube-controller-manager'}
      icon={<Sliders size={15} />}
      status={nodeData.status}
      accentColor="#a855f7"
    />
  );
};
