import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';
import { LifecycleStep } from '../model/types.ts';

describe('animationSlice in useAppStore', () => {
  const mockSteps: LifecycleStep[] = [
    {
      stepNumber: 1,
      title: 'Step 1: Kubectl Apply',
      componentName: 'kubectl',
      componentRole: 'CLI',
      what: 'Send request',
      why: 'Apply spec',
    },
    {
      stepNumber: 2,
      title: 'Step 2: API Server Auth',
      componentName: 'kube-apiserver',
      componentRole: 'API Gateway',
      what: 'Authenticate',
      why: 'Security',
    },
    {
      stepNumber: 3,
      title: 'Step 3: etcd Commit',
      componentName: 'etcd',
      componentRole: 'Storage',
      what: 'Persist state',
      why: 'Durability',
    },
  ];

  beforeEach(() => {
    useAppStore.setState({
      steps: mockSteps,
      currentStepIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
    });
  });

  it('steps forward through animation steps and clamps at end', () => {
    const store = useAppStore.getState();
    expect(store.currentStepIndex).toBe(0);

    store.stepForward();
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    store.stepForward();
    expect(useAppStore.getState().currentStepIndex).toBe(2);

    // Clamps at last index (2) and stops playing
    store.stepForward();
    expect(useAppStore.getState().currentStepIndex).toBe(2);
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('steps backward through animation steps and clamps at 0', () => {
    useAppStore.setState({ currentStepIndex: 2 });
    const store = useAppStore.getState();

    store.stepBackward();
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    store.stepBackward();
    expect(useAppStore.getState().currentStepIndex).toBe(0);

    store.stepBackward();
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('updates playback speed and toggles isPlaying state', () => {
    const store = useAppStore.getState();
    store.setPlaybackSpeed(2);
    expect(useAppStore.getState().playbackSpeed).toBe(2);

    store.setIsPlaying(true);
    expect(useAppStore.getState().isPlaying).toBe(true);
  });

  it('resets animation to step index 0 and pauses playback', () => {
    useAppStore.setState({ currentStepIndex: 2, isPlaying: true });
    const store = useAppStore.getState();

    store.resetAnimation();
    expect(useAppStore.getState().currentStepIndex).toBe(0);
    expect(useAppStore.getState().isPlaying).toBe(false);
  });
});
