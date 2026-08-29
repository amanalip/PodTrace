import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { applyStepToDiagram } from './AnimationEngine.ts';
import { StepIndicator } from './StepIndicator.tsx';
import styles from './AnimationController.module.css';

export const AnimationController: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    setIsPlaying,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    resetAnimation,
    nodes,
    edges,
    setNodes,
    setEdges,
  } = useAppStore();

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentStepIndexRef = useRef(currentStepIndex);
  currentStepIndexRef.current = currentStepIndex;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Apply visual status updates whenever step changes or animation resets
  useEffect(() => {
    if (steps.length === 0) return;
    const currentStep = steps[currentStepIndex];
    const { nodes: currentNodes, edges: currentEdges } = useAppStore.getState();
    const { nodes: updatedNodes, edges: updatedEdges } = applyStepToDiagram(
      currentStep,
      currentNodes,
      currentEdges,
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [currentStepIndex, steps, setNodes, setEdges]);

  // Animation autoplay loop
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const currentStep = steps[currentStepIndex];
    const duration = (currentStep?.durationMs || 2000) / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentStepIndexRef.current < stepsRef.current.length - 1) {
        stepForward();
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed, steps, stepForward, setIsPlaying]);

  if (!steps || steps.length === 0) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleReset = () => {
    setIsPlaying(false);
    resetAnimation();
    const { nodes: resetNodes, edges: resetEdges } = applyStepToDiagram(undefined, nodes, edges);
    setNodes(resetNodes);
    setEdges(resetEdges);
  };

  return (
    <div className={styles.controllerContainer} data-testid="animation-controller">
      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={handleReset}
          title="Reset animation to start (R)"
          aria-label="Reset animation (R)"
        >
          <RotateCcw size={15} />
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={stepBackward}
          disabled={isFirstStep}
          title="Step backward (Left Arrow)"
          aria-label="Previous step (Left Arrow)"
        >
          <SkipBack size={15} />
        </button>

        <button
          type="button"
          className={`${styles.controlButton} ${styles.playButton}`}
          onClick={() => {
            if (isLastStep && !isPlaying) {
              resetAnimation();
            }
            setIsPlaying(!isPlaying);
          }}
          title={isPlaying ? 'Pause animation (Space)' : 'Play animation (Space)'}
          aria-label={isPlaying ? 'Pause animation (Space)' : 'Play animation (Space)'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={stepForward}
          disabled={isLastStep}
          title="Step forward (Right Arrow)"
          aria-label="Next step (Right Arrow)"
        >
          <SkipForward size={15} />
        </button>
      </div>

      <div className={styles.divider} />

      <StepIndicator />

      <div className={styles.divider} />

      <select
        className={styles.speedSelect}
        value={playbackSpeed}
        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        aria-label="Select playback speed"
        title="Playback speed"
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1.0x</option>
        <option value={2}>2.0x</option>
        <option value={3}>3.0x</option>
      </select>
    </div>
  );
};
