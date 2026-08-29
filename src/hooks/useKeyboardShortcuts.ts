import { useEffect } from 'react';
import { useAppStore } from '../store/index.ts';

export function useKeyboardShortcuts(): void {
  const {
    isPlaying,
    setIsPlaying,
    stepForward,
    stepBackward,
    setCurrentStepIndex,
    steps,
    setSelectedNodeId,
    clearWhatIf,
    isShortcutsOpen,
    setIsShortcutsOpen,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable ||
        (typeof target?.closest === 'function' && target.closest('.cm-editor'))
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          if (target?.tagName === 'BUTTON' || target?.tagName === 'A') {
            return;
          }
          e.preventDefault();
          setIsPlaying(!useAppStore.getState().isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentStepIndex(0);
          break;
        case 'End':
          e.preventDefault();
          if (steps.length > 0) {
            setCurrentStepIndex(steps.length - 1);
          }
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(!useAppStore.getState().isShortcutsOpen);
          break;
        case 'Escape':
          setSelectedNodeId(null);
          clearWhatIf();
          setIsShortcutsOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    stepForward,
    stepBackward,
    setCurrentStepIndex,
    steps,
    setSelectedNodeId,
    clearWhatIf,
    isShortcutsOpen,
    setIsShortcutsOpen,
  ]);
}
