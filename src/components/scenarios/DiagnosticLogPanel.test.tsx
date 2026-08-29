import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagnosticLogPanel } from './DiagnosticLogPanel.tsx';
import { useAppStore } from '../../store/index.ts';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';

describe('DiagnosticLogPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeScenario: null,
      scenarioState: 'idle',
    });
  });

  it('renders placeholder when no active scenario is loaded', () => {
    render(<DiagnosticLogPanel />);
    expect(screen.getByText(/No active scenario loaded/i)).toBeInTheDocument();
  });

  it('renders events and filters by query', () => {
    const scenario = SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: scenario,
      scenarioState: 'failed',
    });

    render(<DiagnosticLogPanel />);

    expect(screen.getByRole('button', { name: /events \(/i })).toBeInTheDocument();
    expect(screen.getByTestId('diag-filter-input')).toBeInTheDocument();

    const input = screen.getByTestId('diag-filter-input');
    fireEvent.change(input, { target: { value: 'nonexistent-pattern-xyz' } });

    expect(screen.getByText(/No events matching search filter/i)).toBeInTheDocument();
  });

  it('renders container logs and allows copying logs', () => {
    const scenario = SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: scenario,
      scenarioState: 'failed',
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<DiagnosticLogPanel />);

    const logsTab = screen.getByText(/Logs \(/i);
    fireEvent.click(logsTab);

    expect(screen.getByTestId('log-terminal')).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-all-logs-btn');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('renders dynamic conditions reflecting failed scheduling', () => {
    const schedulingScenario = SCENARIO_CATALOG.find((s) => s.id === 'pending-cpu') || SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: schedulingScenario,
      scenarioState: 'failed',
    });

    render(<DiagnosticLogPanel />);

    const conditionsTab = screen.getByText('Conditions');
    fireEvent.click(conditionsTab);

    expect(screen.getByText('PodScheduled')).toBeInTheDocument();
    expect(screen.getByText('ContainersReady')).toBeInTheDocument();
  });

  it('clears filter query when clear filter button is clicked', () => {
    const scenario = SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: scenario,
      scenarioState: 'failed',
    });

    render(<DiagnosticLogPanel />);

    const input = screen.getByTestId('diag-filter-input');
    fireEvent.change(input, { target: { value: 'nonexistent-xyz' } });

    const clearBtn = screen.getByTestId('clear-diag-filter-btn');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input).toHaveValue('');
  });

  it('allows copying all diagnostic events and clears with search icon', () => {
    const scenario = SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: scenario,
      scenarioState: 'failed',
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<DiagnosticLogPanel />);

    const copyEventsBtn = screen.getByTestId('copy-all-events-btn');
    fireEvent.click(copyEventsBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const input = screen.getByTestId('diag-filter-input');
    fireEvent.change(input, { target: { value: 'test-filter' } });

    const clearIcon = screen.getByTestId('clear-diag-search-icon');
    fireEvent.click(clearIcon);
    expect(input).toHaveValue('');
  });
});
