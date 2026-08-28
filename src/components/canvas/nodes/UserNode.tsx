import React from 'react';
import { NodeProps } from '@xyflow/react';
import { User, Terminal } from 'lucide-react';
import { DiagramNodeData } from '../../../model/types.ts';
import { BaseNode } from './BaseNode.tsx';

export const UserNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'Developer'}
      subLabel={nodeData.subLabel || 'Workstation'}
      icon={<User size={15} />}
      status={nodeData.status}
      accentColor="#64748b"
      hasInput={false}
      hasOutput={true}
    />
  );
};

export const KubectlNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as DiagramNodeData;
  return (
    <BaseNode
      label={nodeData.label || 'kubectl'}
      subLabel={nodeData.subLabel || 'CLI client'}
      icon={<Terminal size={15} />}
      status={nodeData.status}
      accentColor="#38bdf8"
      hasInput={true}
      hasOutput={true}
    />
  );
};
