import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasToolbar } from './CanvasToolbar.tsx';
import { useAppStore } from '../../store/index.ts';

describe('CanvasToolbar', () => {
  it('renders canvas toolbar buttons', () => {
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    expect(screen.getByTestId('canvas-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-fit-view')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-zoom-in')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-zoom-out')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-reset')).toBeInTheDocument();
  });

  it('resets animation on reset button click', () => {
    const resetSpy = vi.spyOn(useAppStore.getState(), 'resetAnimation');
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    const resetBtn = screen.getByTestId('canvas-reset');
    fireEvent.click(resetBtn);

    expect(resetSpy).toHaveBeenCalled();
  });
});
