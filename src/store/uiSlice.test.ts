import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';

describe('uiSlice in useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: 'dark',
      activeSidebarTab: 'editor',
      rightPanelTab: 'lifecycle',
      isLegendOpen: false,
      isInspectorOpen: false,
      isShortcutsOpen: false,
    });
  });

  it('toggles theme between dark and light', () => {
    const store = useAppStore.getState();
    expect(store.theme).toBe('dark');

    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');

    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('sets active sidebar tab cleanly', () => {
    const store = useAppStore.getState();
    store.setActiveSidebarTab('scenarios');
    expect(useAppStore.getState().activeSidebarTab).toBe('scenarios');

    store.setActiveSidebarTab('concepts');
    expect(useAppStore.getState().activeSidebarTab).toBe('concepts');
  });

  it('sets right panel tab cleanly', () => {
    const store = useAppStore.getState();
    store.setRightPanelTab('diagnostics');
    expect(useAppStore.getState().rightPanelTab).toBe('diagnostics');

    store.setRightPanelTab('lifecycle');
    expect(useAppStore.getState().rightPanelTab).toBe('lifecycle');
  });

  it('controls modal and drawer open states', () => {
    const store = useAppStore.getState();
    store.setIsLegendOpen(true);
    expect(useAppStore.getState().isLegendOpen).toBe(true);

    store.setIsInspectorOpen(true);
    expect(useAppStore.getState().isInspectorOpen).toBe(true);

    store.setIsShortcutsOpen(true);
    expect(useAppStore.getState().isShortcutsOpen).toBe(true);
  });
});
