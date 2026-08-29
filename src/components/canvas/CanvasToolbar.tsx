import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './CanvasToolbar.module.css';

export const CanvasToolbar: React.FC = () => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { resetAnimation } = useAppStore();

  const handleReset = () => {
    resetAnimation();
    fitView({ duration: 300 });
  };

  return (
    <div className={styles.toolbar} data-testid="canvas-toolbar">
      <button
        type="button"
        className={styles.button}
        onClick={() => fitView({ duration: 300 })}
        title="Fit diagram to viewport"
        aria-label="Fit diagram to viewport"
        data-testid="canvas-fit-view"
      >
        <Maximize2 size={14} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={() => zoomIn({ duration: 200 })}
        title="Zoom in"
        aria-label="Zoom in"
        data-testid="canvas-zoom-in"
      >
        <ZoomIn size={14} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={() => zoomOut({ duration: 200 })}
        title="Zoom out"
        aria-label="Zoom out"
        data-testid="canvas-zoom-out"
      >
        <ZoomOut size={14} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        className={styles.button}
        onClick={handleReset}
        title="Reset viewport and animation"
        aria-label="Reset viewport and animation"
        data-testid="canvas-reset"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};
