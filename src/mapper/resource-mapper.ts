import { Node, Edge } from '@xyflow/react';
import { K8sResource } from '../model/types.ts';
import {
  PodResource,
  DeploymentResource,
  ServiceResource,
  IngressResource,
  ConfigMapResource,
  SecretResource,
  PersistentVolumeClaimResource,
} from '../parser/resource-types.ts';
import { mapPodResource } from './pod-mapper.ts';
import { mapDeploymentResource } from './deployment-mapper.ts';
import { mapServiceResource } from './service-mapper.ts';
import { mapIngressResource } from './ingress-mapper.ts';
import { mapConfigResource } from './config-mapper.ts';
import { mapCompositeResources } from './composite-mapper.ts';
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

  if (resources.length > 1) {
    return mapCompositeResources(resources);
  }

  const primaryResource = resources[0];

  switch (primaryResource.kind) {
    case 'Pod':
      return mapPodResource(primaryResource as PodResource);
    case 'Deployment':
      return mapDeploymentResource(primaryResource as DeploymentResource);
    case 'Service':
      return mapServiceResource(primaryResource as ServiceResource);
    case 'Ingress':
      return mapIngressResource(primaryResource as IngressResource);
    case 'ConfigMap':
    case 'Secret':
    case 'PersistentVolumeClaim':
      return mapConfigResource(
        primaryResource as ConfigMapResource | SecretResource | PersistentVolumeClaimResource,
      );
    default:
      return {
        nodes: STATIC_INITIAL_NODES,
        edges: STATIC_INITIAL_EDGES,
      };
  }
}
