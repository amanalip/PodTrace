import React from 'react';
import { useAppStore } from '../../store/index.ts';
import styles from './LiveRegion.module.css';

export const LiveRegion: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    scenarioState,
    scenarioFeedback,
    activeScenario,
  } = useAppStore();

  const currentStep = steps[currentStepIndex];
  let announcement = '';

  if (scenarioState === 'failed' && activeScenario) {
    announcement = `Scenario failed: ${activeScenario.title}. Error: ${activeScenario.failureDetails.errorType}.`;
  } else if (scenarioState === 'fixing') {
    announcement = scenarioFeedback || 'Fix attempt evaluated.';
  } else if (scenarioState === 'resolved' && activeScenario) {
    announcement = scenarioFeedback || activeScenario.successMessage;
  } else if (scenarioState === 'completed') {
    announcement = 'Scenario resolved successfully!';
  } else if (currentStep) {
    announcement = `Step ${currentStep.stepNumber} of ${steps.length}: ${currentStep.title}. ${currentStep.what}`;
  }

  return (
    <div
      className={styles.srOnly}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="aria-live-region"
    >
      {announcement}
    </div>
  );
};
