export type ThemeMode = 'dark' | 'light';
export type NodeStatus = 'idle' | 'active' | 'success' | 'error' | 'warning';
export type EdgeStatus = 'inactive' | 'active' | 'complete' | 'error' | 'warning';
export type ZoneType = 'workstation' | 'cluster' | 'control-plane' | 'worker-node' | 'namespace';

export interface K8sResourceMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface K8sResource {
  apiVersion: string;
  kind: string;
  metadata: K8sResourceMetadata;
  spec?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ValidationError {
  line?: number;
  message: string;
  field?: string;
}

export interface DiagramNodeData {
  label: string;
  componentType: string;
  status: NodeStatus;
  subLabel?: string;
  zone?: ZoneType;
  details?: Record<string, unknown>;
  resourceRef?: string;
  iconName?: string;
}

export interface LifecycleStep {
  stepNumber: number;
  title: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  edgeId?: string;
  edgeLabel?: string;
  what: string;
  why: string;
  componentName: string;
  componentRole: string;
  docsUrl?: string;
  durationMs?: number;
  nodeStatusUpdates?: Record<string, NodeStatus>;
  edgeStatusUpdates?: Record<string, EdgeStatus>;
}

export type ScenarioDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ScenarioCategory = 'Workloads' | 'Networking' | 'Config' | 'Scaling' | 'Troubleshooting';

export interface Scenario {
  id: string;
  title: string;
  difficulty: ScenarioDifficulty;
  category: ScenarioCategory;
  description: string;
  yaml: string;
  steps: LifecycleStep[];
  tryPrompt: string;
  docsUrl?: string;
}

export interface ConceptCardData {
  id: string;
  title: string;
  definition: string;
  keyFact: string;
  docsUrl: string;
}
