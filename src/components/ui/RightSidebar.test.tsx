import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightSidebar } from './RightSidebar.tsx';
import { useAppStore } from '../../store/index.ts';
import { SCENARIO_CATALOG } from '../../scenarios/scenario-data.ts';

describe('RightSidebar', () => {
  beforeEach(() => {
    useAppStore.setState({
      rightPanelTab: 'lifecycle',
      activeScenario: null,
      steps: [
        {
          stepNumber: 1,
          title: 'kubectl submits manifest',
          what: 'Running kubectl apply',
          why: 'Client entrypoint',
          componentName: 'kubectl',
          componentRole: 'CLI client',
          docsUrl: 'https://kubernetes.io',
          durationMs: 1000,
        },
      ],
    });
  });

  it('renders Lifecycle Trace tab by default with step items and ARIA selected', () => {
    render(<RightSidebar />);

    const lifecycleTab = screen.getByRole('tab', { name: /lifecycle trace/i });
    const diagnosticsTab = screen.getByRole('tab', { name: /diagnostics/i });

    expect(lifecycleTab).toHaveAttribute('aria-selected', 'true');
    expect(diagnosticsTab).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByTestId('explanation-panel')).toBeInTheDocument();
    expect(screen.getByText('kubectl submits manifest')).toBeInTheDocument();
  });

  it('switches to Diagnostics tab and renders DiagnosticLogPanel', () => {
    render(<RightSidebar />);

    const diagTab = screen.getByRole('tab', { name: /diagnostics/i });
    fireEvent.click(diagTab);

    expect(useAppStore.getState().rightPanelTab).toBe('diagnostics');
    expect(
      screen.getByText(/No active scenario loaded\. Select a scenario/i),
    ).toBeInTheDocument();
  });

  it('switches back to Lifecycle Trace tab when clicked', () => {
    useAppStore.setState({ rightPanelTab: 'diagnostics' });
    render(<RightSidebar />);

    const lifecycleTab = screen.getByRole('tab', { name: /lifecycle trace/i });
    fireEvent.click(lifecycleTab);

    expect(useAppStore.getState().rightPanelTab).toBe('lifecycle');
    expect(screen.getByTestId('explanation-panel')).toBeInTheDocument();
  });

  it('renders active failure badge count when a scenario is failed', () => {
    const sc = SCENARIO_CATALOG[0];
    useAppStore.setState({
      activeScenario: sc,
      scenarioState: 'failed',
    });

    render(<RightSidebar />);
    expect(screen.getByRole('tab', { name: /diagnostics/i })).toBeInTheDocument();
  });
});
