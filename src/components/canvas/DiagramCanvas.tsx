import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '../../store/index.ts';
import { UserNode, KubectlNode } from './nodes/UserNode.tsx';
import {
  APIServerNode,
  ETCDNode,
  SchedulerNode,
  ControllerManagerNode,
} from './nodes/ControlPlaneNodes.tsx';
import {
  KubeletNode,
  KubeProxyNode,
  ContainerRuntimeNode,
  PodNode,
} from './nodes/WorkerNodes.tsx';
import {
  WorkstationZone,
  ClusterZone,
  ControlPlaneZone,
  WorkerNodeZone,
  NamespaceZone,
} from './zones/Zones.tsx';
import { FlowEdge } from './edges/FlowEdge.tsx';
import {
  STATIC_INITIAL_NODES,
  STATIC_INITIAL_EDGES,
} from './initial-elements.ts';
import { CanvasToolbar } from './CanvasToolbar.tsx';
import { AnimationController } from '../animation/AnimationController.tsx';
import { DiagramLegend } from './DiagramLegend.tsx';
import { FailureOverlay } from '../scenarios/FailureOverlay.tsx';
import { ComponentInspector } from '../inspector/ComponentInspector.tsx';
import { WhatIfPanel } from '../whatif/WhatIfPanel.tsx';
import styles from './DiagramCanvas.module.css';

export const DiagramCanvas: React.FC = () => {
  const { nodes: storeNodes, edges: storeEdges, setSelectedNodeId } = useAppStore();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      userNode: UserNode,
      kubectlNode: KubectlNode,
      apiServerNode: APIServerNode,
      etcdNode: ETCDNode,
      schedulerNode: SchedulerNode,
      controllerManagerNode: ControllerManagerNode,
      kubeletNode: KubeletNode,
      kubeProxyNode: KubeProxyNode,
      containerRuntimeNode: ContainerRuntimeNode,
      podNode: PodNode,
      workstationZone: WorkstationZone,
      clusterZone: ClusterZone,
      controlPlaneZone: ControlPlaneZone,
      workerNodeZone: WorkerNodeZone,
      namespaceZone: NamespaceZone,
    }),
    [],
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      flowEdge: FlowEdge,
    }),
    [],
  );

  const currentNodes = storeNodes.length > 0 ? storeNodes : STATIC_INITIAL_NODES;
  const currentEdges = storeEdges.length > 0 ? storeEdges : STATIC_INITIAL_EDGES;

  return (
    <div className={styles.canvasWrapper} data-testid="diagram-canvas-container">
      <ReactFlow
        nodes={currentNodes}
        edges={currentEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
        <Controls />
        <CanvasToolbar />
        <MiniMap
          nodeColor={(n) => {
            if (n.type?.includes('Zone')) return 'transparent';
            if (n.type?.includes('apiServer') || n.type?.includes('etcd') || n.type?.includes('scheduler'))
              return '#3b82f6';
            if (n.type?.includes('kubelet') || n.type?.includes('Runtime') || n.type?.includes('Proxy'))
              return '#10b981';
            return '#6366f1';
          }}
          maskColor="rgba(15, 20, 28, 0.7)"
        />
      </ReactFlow>
      <FailureOverlay />
      <ComponentInspector />
      <WhatIfPanel />
      <DiagramLegend />
      <AnimationController />
    </div>
  );
};
