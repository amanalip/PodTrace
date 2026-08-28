import { NodeStatus, EdgeStatus } from '../model/types.ts';

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  category: 'control-plane' | 'worker-node' | 'networking' | 'storage';
  affectedNodeIds: string[];
  nodeStatusOverrides: Record<string, NodeStatus>;
  edgeStatusOverrides?: Record<string, EdgeStatus>;
  consequences: string[];
  mitigation: string;
}
