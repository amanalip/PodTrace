import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightSidebar } from './RightSidebar.tsx';
import { useAppStore } from '../../store/index.ts';

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

  it('renders Lifecycle Trace tab by default with step items', () => {
    render(<RightSidebar />);

    expect(screen.getByText('Lifecycle Trace')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
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
});
