import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.ts';
import { useAppStore } from '../store/index.ts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    useAppStore.setState({
      isPlaying: false,
      currentStepIndex: 0,
      steps: [
        { stepNumber: 1, title: 'Step 1', componentName: 'A', componentRole: 'R', what: 'W1', why: 'Why1' },
        { stepNumber: 2, title: 'Step 2', componentName: 'B', componentRole: 'R', what: 'W2', why: 'Why2' },
        { stepNumber: 3, title: 'Step 3', componentName: 'C', componentRole: 'R', what: 'W3', why: 'Why3' },
      ],
      selectedNodeId: 'node-apiserver',
      isShortcutsOpen: false,
    });
  });

  it('toggles isPlaying on Space press', () => {
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(useAppStore.getState().isPlaying).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('steps forward on ArrowRight and backward on ArrowLeft', () => {
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('jumps to first/last step on Home/End', () => {
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(useAppStore.getState().currentStepIndex).toBe(2);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('clears selected node on Escape', () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().selectedNodeId).toBe('node-apiserver');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(useAppStore.getState().selectedNodeId).toBeNull();
  });

  it('resets animation on r key press', () => {
    useAppStore.setState({ currentStepIndex: 2 });
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('adjusts playback speed on [ and ] key press', () => {
    useAppStore.setState({ playbackSpeed: 1 });
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
    expect(useAppStore.getState().playbackSpeed).toBe(2);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '[' }));
    expect(useAppStore.getState().playbackSpeed).toBe(1);
  });

  it('ignores arrow keys when alt or ctrl modifiers are held', () => {
    useAppStore.setState({ currentStepIndex: 1 });
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }));
    expect(useAppStore.getState().currentStepIndex).toBe(1);
  });

  it('toggles shortcuts help modal on ? key press', () => {
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    expect(useAppStore.getState().isShortcutsOpen).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    expect(useAppStore.getState().isShortcutsOpen).toBe(false);
  });

  it('clamps minimum playback speed at 0.5x when pressing [', () => {
    useAppStore.setState({ playbackSpeed: 0.5 });
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '[' }));
    expect(useAppStore.getState().playbackSpeed).toBe(0.5);
  });

  it('clamps maximum playback speed at 3x when pressing ]', () => {
    useAppStore.setState({ playbackSpeed: 3 });
    renderHook(() => useKeyboardShortcuts());

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
    expect(useAppStore.getState().playbackSpeed).toBe(3);
  });
});
