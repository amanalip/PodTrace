import { K8sResource } from '../model/types.ts';

export type ScenarioCategory =
  | 'pod-lifecycle'
  | 'scheduling'
  | 'networking'
  | 'storage'
  | 'security'
  | 'scale-update';

export type ScenarioDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ScenarioState =
  | 'idle'
  | 'running'
  | 'failed'
  | 'fixing'
  | 'resolved'
  | 'completed';

export interface ScenarioLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  component: string;
}

export interface ScenarioEvent {
  type: 'Normal' | 'Warning';
  reason: string;
  message: string;
  from: string;
  age: string;
}

export interface ScenarioFailureDetails {
  errorType: string;
  failingStep: number;
  failingNodeId: string;
  failingEdgeId?: string;
  logs: ScenarioLogEntry[];
  events: ScenarioEvent[];
  fixHint: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  description: string;
  yamlTemplate: string;
  failureStep: number;
  failureDetails: ScenarioFailureDetails;
  successMessage: string;
  explanation: string;
  validator: (yaml: string, resources: K8sResource[]) => { isFixed: boolean; feedback?: string };
}
