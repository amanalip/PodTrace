import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type {
  K8sResource,
  ValidationError,
  LifecycleStep,
  ThemeMode,
} from '../model/types.ts';
import { DEFAULT_SAMPLE_YAML } from '../model/constants.ts';

import { Scenario, ScenarioState } from '../scenarios/scenario-types.ts';
import { evaluateScenarioFix, injectScenarioFailureIntoSteps } from '../scenarios/scenario-runner.ts';
import { mapResourcesToDiagram } from '../mapper/resource-mapper.ts';
import { getLifecycleStepsForResources } from '../lifecycle/steps.ts';
import { parseK8sYaml } from '../parser/yaml-parser.ts';
import { applyStepToDiagram } from '../components/animation/AnimationEngine.ts';

export interface EditorSlice {
  yaml: string;
  parsedResources: K8sResource[];
  validationErrors: ValidationError[];
  setYaml: (yaml: string) => void;
  setParsedResources: (resources: K8sResource[]) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
}

export interface DiagramSlice {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  resetDiagram: () => void;
}

export interface AnimationSlice {
  steps: LifecycleStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  setSteps: (steps: LifecycleStep[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetAnimation: () => void;
}

export interface ScenariosSlice {
  activeScenarioId: string | null;
  activeScenario: Scenario | null;
  scenarioState: ScenarioState;
  scenarioFeedback: string | null;
  completedScenarioIds: string[];
  setActiveScenarioId: (id: string | null) => void;
  loadScenario: (scenario: Scenario) => void;
  setScenarioState: (state: ScenarioState) => void;
  setScenarioFeedback: (feedback: string | null) => void;
  checkScenarioFix: (yaml: string, resources: K8sResource[]) => boolean;
  resolveScenario: () => void;
  resetScenario: () => void;
  markScenarioCompleted: (id: string) => void;
}

import { WhatIfScenario } from '../whatif/whatif-types.ts';

export interface WhatIfSlice {
  activeWhatIfId: string | null;
  activeWhatIf: WhatIfScenario | null;
  applyWhatIf: (scenario: WhatIfScenario) => void;
  clearWhatIf: () => void;
}

export interface UISlice {
  theme: ThemeMode;
  activeSidebarTab: 'editor' | 'scenarios' | 'concepts';
  rightPanelTab: 'lifecycle' | 'diagnostics';
  isLegendOpen: boolean;
  isInspectorOpen: boolean;
  isShortcutsOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveSidebarTab: (tab: 'editor' | 'scenarios' | 'concepts') => void;
  setRightPanelTab: (tab: 'lifecycle' | 'diagnostics') => void;
  setIsLegendOpen: (isOpen: boolean) => void;
  setIsInspectorOpen: (isOpen: boolean) => void;
  setIsShortcutsOpen: (isOpen: boolean) => void;
}

export type AppStore = EditorSlice &
  DiagramSlice &
  AnimationSlice &
  ScenariosSlice &
  WhatIfSlice &
  UISlice;

export const useAppStore = create<AppStore>((set) => ({
  // Editor Slice
  yaml: DEFAULT_SAMPLE_YAML,
  parsedResources: [],
  validationErrors: [],
  setYaml: (yaml) => set({ yaml }),
  setParsedResources: (parsedResources) => set({ parsedResources }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),

  // Diagram Slice
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodes: (nodes) =>
    set((state) => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
    })),
  setEdges: (edges) =>
    set((state) => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges,
    })),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  resetDiagram: () => set({ nodes: [], edges: [], selectedNodeId: null }),

  // Animation Slice
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  setSteps: (steps) => set({ steps, currentStepIndex: 0, isPlaying: false }),
  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  stepForward: () =>
    set((state) => ({
      currentStepIndex: Math.min(
        state.currentStepIndex + 1,
        Math.max(0, state.steps.length - 1),
      ),
    })),
  stepBackward: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    })),
  resetAnimation: () => set({ currentStepIndex: 0, isPlaying: false }),

  // Scenarios Slice
  activeScenarioId: null,
  activeScenario: null,
  scenarioState: 'idle',
  scenarioFeedback: null,
  completedScenarioIds: [],
  setActiveScenarioId: (activeScenarioId) => set({ activeScenarioId }),
  loadScenario: (scenario) => {
    const parsed = parseK8sYaml(scenario.yamlTemplate);
    const { nodes, edges } = mapResourcesToDiagram(parsed.resources);
    const normalSteps = getLifecycleStepsForResources(parsed.resources);
    const stepsWithFailure = injectScenarioFailureIntoSteps(normalSteps, scenario);

    set({
      activeScenarioId: scenario.id,
      activeScenario: scenario,
      scenarioState: 'failed',
      scenarioFeedback: null,
      yaml: scenario.yamlTemplate,
      parsedResources: parsed.resources,
      validationErrors: parsed.errors,
      nodes,
      edges,
      steps: stepsWithFailure,
      currentStepIndex: Math.max(0, scenario.failureStep - 1),
      isPlaying: false,
      activeSidebarTab: 'editor',
      rightPanelTab: 'diagnostics',
    });
  },
  setScenarioState: (scenarioState) => set({ scenarioState }),
  setScenarioFeedback: (scenarioFeedback) => set({ scenarioFeedback }),
  checkScenarioFix: (yaml, resources) => {
    let fixed = false;
    set((state) => {
      if (!state.activeScenario) return state;
      const result = evaluateScenarioFix(state.activeScenario, yaml, resources);
      fixed = result.isFixed;
      if (result.isFixed) {
        const { nodes, edges } = mapResourcesToDiagram(resources);
        const resolvedSteps = getLifecycleStepsForResources(resources);
        return {
          scenarioState: 'resolved',
          scenarioFeedback: state.activeScenario.successMessage,
          nodes,
          edges,
          steps: resolvedSteps,
        };
      }
      return {
        scenarioState: 'fixing',
        scenarioFeedback: result.feedback || null,
      };
    });
    return fixed;
  },
  resolveScenario: () =>
    set((state) => {
      if (!state.activeScenarioId) return state;
      const completed = state.completedScenarioIds.includes(state.activeScenarioId)
        ? state.completedScenarioIds
        : [...state.completedScenarioIds, state.activeScenarioId];
      return {
        scenarioState: 'completed',
        completedScenarioIds: completed,
      };
    }),
  resetScenario: () =>
    set((state) => {
      if (!state.activeScenario) {
        return {
          activeScenarioId: null,
          activeScenario: null,
          scenarioState: 'idle',
          scenarioFeedback: null,
        };
      }
      const parsed = parseK8sYaml(state.activeScenario.yamlTemplate);
      const { nodes, edges } = mapResourcesToDiagram(parsed.resources);
      const normalSteps = getLifecycleStepsForResources(parsed.resources);
      const stepsWithFailure = injectScenarioFailureIntoSteps(
        normalSteps,
        state.activeScenario,
      );

      return {
        scenarioState: 'failed',
        scenarioFeedback: null,
        yaml: state.activeScenario.yamlTemplate,
        parsedResources: parsed.resources,
        validationErrors: parsed.errors,
        nodes,
        edges,
        steps: stepsWithFailure,
        currentStepIndex: Math.max(0, state.activeScenario.failureStep - 1),
        isPlaying: false,
      };
    }),
  markScenarioCompleted: (id) =>
    set((state) => ({
      completedScenarioIds: state.completedScenarioIds.includes(id)
        ? state.completedScenarioIds
        : [...state.completedScenarioIds, id],
    })),

  // What-If Slice
  activeWhatIfId: null,
  activeWhatIf: null,
  applyWhatIf: (scenario) =>
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        const overrideStatus = scenario.nodeStatusOverrides[node.id];
        if (overrideStatus) {
          return {
            ...node,
            data: {
              ...(node.data || {}),
              status: overrideStatus,
            },
          };
        }
        return node;
      });

      const updatedEdges = state.edges.map((edge) => {
        const overrideEdgeStatus = scenario.edgeStatusOverrides?.[edge.id];
        if (overrideEdgeStatus) {
          return {
            ...edge,
            data: {
              ...(edge.data || {}),
              status: overrideEdgeStatus,
            },
          };
        }
        return edge;
      });

      return {
        activeWhatIfId: scenario.id,
        activeWhatIf: scenario,
        isPlaying: false,
        nodes: updatedNodes,
        edges: updatedEdges,
      };
    }),
  clearWhatIf: () =>
    set((state) => {
      const currentStep = state.steps[state.currentStepIndex];
      const { nodes: restoredNodes, edges: restoredEdges } = applyStepToDiagram(
        currentStep,
        state.nodes,
        state.edges,
      );
      return {
        activeWhatIfId: null,
        activeWhatIf: null,
        nodes: restoredNodes,
        edges: restoredEdges,
      };
    }),

  // UI Slice
  theme: 'dark',
  activeSidebarTab: 'editor',
  rightPanelTab: 'lifecycle',
  isLegendOpen: false,
  isInspectorOpen: false,
  isShortcutsOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setIsLegendOpen: (isLegendOpen) => set({ isLegendOpen }),
  setIsInspectorOpen: (isInspectorOpen) => set({ isInspectorOpen }),
  setIsShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
}));
