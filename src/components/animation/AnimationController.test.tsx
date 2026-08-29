import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimationController } from './AnimationController.tsx';
import { useAppStore } from '../../store/index.ts';
import { createPodLifecycleSteps } from '../../lifecycle/pod-lifecycle.ts';

describe('AnimationController', () => {
  beforeEach(() => {
    const steps = createPodLifecycleSteps('test-pod');
    useAppStore.setState({
      steps,
      currentStepIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
    });
  });

  it('renders playback controls and step indicator', () => {
    render(<AnimationController />);

    expect(screen.getByTestId('animation-controller')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play animation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous step/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset animation/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /playback speed/i })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 9/i)).toBeInTheDocument();
  });

  it('steps forward and backward on button click', () => {
    render(<AnimationController />);

    const nextBtn = screen.getByRole('button', { name: /next step/i });
    fireEvent.click(nextBtn);
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    const prevBtn = screen.getByRole('button', { name: /previous step/i });
    fireEvent.click(prevBtn);
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });

  it('toggles play/pause state on play button click', () => {
    render(<AnimationController />);

    const playBtn = screen.getByRole('button', { name: /play animation/i });
    fireEvent.click(playBtn);
    expect(useAppStore.getState().isPlaying).toBe(true);

    const pauseBtn = screen.getByRole('button', { name: /pause animation/i });
    fireEvent.click(pauseBtn);
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('updates playback speed on speed selection change', () => {
    render(<AnimationController />);

    const speedSelect = screen.getByRole('combobox', { name: /playback speed/i });
    fireEvent.change(speedSelect, { target: { value: '2' } });
    expect(useAppStore.getState().playbackSpeed).toBe(2);
  });

  it('resets animation on reset button click', () => {
    useAppStore.setState({ currentStepIndex: 5, isPlaying: true });
    render(<AnimationController />);

    const resetBtn = screen.getByRole('button', { name: /reset animation/i });
    fireEvent.click(resetBtn);

    expect(useAppStore.getState().currentStepIndex).toBe(0);
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('navigates step pills using ArrowLeft and ArrowRight keys', () => {
    render(<AnimationController />);

    const pill0 = screen.getByTestId('step-pill-0');
    expect(pill0).toHaveAttribute('aria-current', 'step');

    fireEvent.keyDown(pill0, { key: 'ArrowRight' });
    expect(useAppStore.getState().currentStepIndex).toBe(1);

    const pill1 = screen.getByTestId('step-pill-1');
    fireEvent.keyDown(pill1, { key: 'ArrowLeft' });
    expect(useAppStore.getState().currentStepIndex).toBe(0);
  });
});
