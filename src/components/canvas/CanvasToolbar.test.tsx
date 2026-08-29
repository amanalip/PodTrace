import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasToolbar } from './CanvasToolbar.tsx';
import { useAppStore } from '../../store/index.ts';

describe('CanvasToolbar', () => {
  it('renders canvas toolbar buttons with ARIA toolbar and separator', () => {
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    expect(screen.getByRole('toolbar', { name: /diagram canvas viewport controls/i })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
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

  it('triggers fit view action when fit view button is clicked', () => {
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    const fitBtn = screen.getByTestId('canvas-fit-view');
    expect(fitBtn).toHaveAttribute('title', 'Fit diagram to viewport');
    fireEvent.click(fitBtn);
  });

  it('triggers zoom in action when zoom in button is clicked', () => {
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    const zoomInBtn = screen.getByTestId('canvas-zoom-in');
    expect(zoomInBtn).toHaveAttribute('title', 'Zoom in');
    fireEvent.click(zoomInBtn);
  });

  it('triggers zoom out action when zoom out button is clicked', () => {
    render(
      <ReactFlowProvider>
        <CanvasToolbar />
      </ReactFlowProvider>,
    );

    const zoomOutBtn = screen.getByTestId('canvas-zoom-out');
    expect(zoomOutBtn).toHaveAttribute('title', 'Zoom out');
    fireEvent.click(zoomOutBtn);
  });
});
