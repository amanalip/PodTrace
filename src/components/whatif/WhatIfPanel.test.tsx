import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIfPanel } from './WhatIfPanel.tsx';
import { useAppStore } from '../../store/index.ts';

describe('WhatIfPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeWhatIfId: null,
      activeWhatIf: null,
      nodes: [
        {
          id: 'node-apiserver',
          type: 'apiServerNode',
          position: { x: 0, y: 0 },
          data: { label: 'kube-apiserver', status: 'idle' },
        },
      ],
      edges: [],
    });
  });

  it('renders launcher button initially and opens panel on click', () => {
    render(<WhatIfPanel />);
    const launcher = screen.getByTestId('what-if-launcher');
    expect(launcher).toBeInTheDocument();

    fireEvent.click(launcher);
    expect(screen.getByTestId('what-if-panel')).toBeInTheDocument();
  });

  it('applies scenario failure override and displays consequences', () => {
    render(<WhatIfPanel />);
    fireEvent.click(screen.getByTestId('what-if-launcher'));

    const select = screen.getByTestId('what-if-select');
    fireEvent.change(select, { target: { value: 'apiserver-down' } });

    const storeState = useAppStore.getState();
    expect(storeState.activeWhatIfId).toBe('apiserver-down');
    expect(storeState.nodes[0].data?.status).toBe('error');

    expect(screen.getByText(/cluster consequences/i)).toBeInTheDocument();
    expect(screen.getByText(/recommended mitigation/i)).toBeInTheDocument();

    // Click Restore Cluster Health
    const restoreBtn = screen.getByTestId('restore-health-btn');
    fireEvent.click(restoreBtn);

    const clearedState = useAppStore.getState();
    expect(clearedState.activeWhatIfId).toBeNull();
    expect(clearedState.nodes[0].data?.status).toBe('idle');
  });
});
