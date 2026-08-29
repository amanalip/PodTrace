import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('toggles minimize and expand without losing active scenario', () => {
    render(<WhatIfPanel />);
    fireEvent.click(screen.getByTestId('what-if-launcher'));

    const select = screen.getByTestId('what-if-select');
    fireEvent.change(select, { target: { value: 'apiserver-down' } });

    expect(screen.getByText(/cluster consequences/i)).toBeInTheDocument();

    const minBtn = screen.getByTestId('what-if-minimize-btn');
    fireEvent.click(minBtn);

    expect(screen.queryByText(/cluster consequences/i)).not.toBeInTheDocument();
    expect(useAppStore.getState().activeWhatIfId).toBe('apiserver-down');

    fireEvent.click(minBtn);
    expect(screen.getByText(/cluster consequences/i)).toBeInTheDocument();
  });

  it('renders category badge and copies recommended mitigation', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<WhatIfPanel />);
    fireEvent.click(screen.getByTestId('what-if-launcher'));

    const select = screen.getByTestId('what-if-select');
    fireEvent.change(select, { target: { value: 'apiserver-down' } });

    expect(screen.getByTestId('what-if-category-badge')).toHaveTextContent(/control-plane/i);

    const copyBtn = screen.getByTestId('copy-mitigation-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
