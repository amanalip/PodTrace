import { Node, Edge } from '@xyflow/react';
import { K8sResource } from '../model/types.ts';
import { PodResource } from '../parser/resource-types.ts';
import { mapPodResource } from './pod-mapper.ts';
import { STATIC_INITIAL_NODES, STATIC_INITIAL_EDGES } from '../components/canvas/initial-elements.ts';

export interface DiagramMappingResult {
  nodes: Node[];
  edges: Edge[];
}

export function mapResourcesToDiagram(resources: K8sResource[]): DiagramMappingResult {
  if (!resources || resources.length === 0) {
    return {
      nodes: STATIC_INITIAL_NODES,
      edges: STATIC_INITIAL_EDGES,
    };
  }

  const primaryResource = resources[0];

  switch (primaryResource.kind) {
    case 'Pod':
      return mapPodResource(primaryResource as PodResource);
    default:
      return {
        nodes: STATIC_INITIAL_NODES,
        edges: STATIC_INITIAL_EDGES,
      };
  }
}
