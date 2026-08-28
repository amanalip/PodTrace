import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type {
  K8sResource,
  ValidationError,
  LifecycleStep,
  ThemeMode,
} from '../model/types.ts';
import { DEFAULT_SAMPLE_YAML } from '../model/constants.ts';

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
  completedScenarioIds: string[];
  setActiveScenarioId: (id: string | null) => void;
  markScenarioCompleted: (id: string) => void;
}

export interface UISlice {
  theme: ThemeMode;
  activeSidebarTab: 'editor' | 'scenarios' | 'concepts';
  isLegendOpen: boolean;
  isInspectorOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveSidebarTab: (tab: 'editor' | 'scenarios' | 'concepts') => void;
  setIsLegendOpen: (isOpen: boolean) => void;
  setIsInspectorOpen: (isOpen: boolean) => void;
}

export type AppStore = EditorSlice &
  DiagramSlice &
  AnimationSlice &
  ScenariosSlice &
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
  completedScenarioIds: [],
  setActiveScenarioId: (activeScenarioId) => set({ activeScenarioId }),
  markScenarioCompleted: (id) =>
    set((state) => ({
      completedScenarioIds: state.completedScenarioIds.includes(id)
        ? state.completedScenarioIds
        : [...state.completedScenarioIds, id],
    })),

  // UI Slice
  theme: 'dark',
  activeSidebarTab: 'editor',
  isLegendOpen: false,
  isInspectorOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),
  setIsLegendOpen: (isLegendOpen) => set({ isLegendOpen }),
  setIsInspectorOpen: (isInspectorOpen) => set({ isInspectorOpen }),
}));
