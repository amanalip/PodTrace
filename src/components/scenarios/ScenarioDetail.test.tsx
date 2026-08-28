import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioDetail } from './ScenarioDetail.tsx';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';
import { useAppStore } from '../../store/index.ts';

describe('ScenarioDetail', () => {
  const scenario = SCENARIO_CATALOG[0];

  it('renders scenario title, category, and explanation', () => {
    const onBack = vi.fn();
    render(<ScenarioDetail scenario={scenario} onBack={onBack} />);

    expect(screen.getByText(scenario.title)).toBeInTheDocument();
    expect(screen.getByText(scenario.category)).toBeInTheDocument();
    expect(screen.getByText(/failure context:/i)).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /back to scenarios/i });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });

  it('starts scenario when Start Scenario is clicked', () => {
    const onBack = vi.fn();
    render(<ScenarioDetail scenario={scenario} onBack={onBack} />);

    const startBtn = screen.getByRole('button', { name: /start scenario/i });
    fireEvent.click(startBtn);

    const storeState = useAppStore.getState();
    expect(storeState.activeScenarioId).toBe(scenario.id);
    expect(storeState.scenarioState).toBe('failed');
  });
});
