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

    const backBtn = screen.getByRole('button', { name: /back to scenario/i });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });

  it('starts scenario when Start Scenario is clicked', () => {
    const onBack = vi.fn();
    render(<ScenarioDetail scenario={scenario} onBack={onBack} />);

    const startBtn = screen.getByTestId('start-scenario-btn');
    fireEvent.click(startBtn);

    const storeState = useAppStore.getState();
    expect(storeState.activeScenarioId).toBe(scenario.id);
    expect(storeState.scenarioState).toBe('failed');
    expect(storeState.activeSidebarTab).toBe('editor');
  });

  it('toggles starting manifest preview and allows copying', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const onBack = vi.fn();
    render(<ScenarioDetail scenario={scenario} onBack={onBack} />);

    expect(screen.queryByText(/busybox:latest/i)).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-scenario-yaml-btn');
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/busybox:latest/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-scenario-yaml-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(scenario.yamlTemplate);
  });
});
