import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';
import { getWhatIfScenario } from '../whatif/whatif-data.ts';

describe('whatIfSlice in useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeWhatIfId: null,
      activeWhatIf: null,
      isPlaying: false,
    });
  });

  it('applies what-if scenario overrides to node and edge states', () => {
    const sc = getWhatIfScenario('apiserver-down')!;
    const store = useAppStore.getState();

    store.setNodes([
      { id: 'node-apiserver', position: { x: 0, y: 0 }, data: { status: 'idle' } },
      { id: 'node-kubelet', position: { x: 100, y: 100 }, data: { status: 'idle' } },
    ]);

    store.applyWhatIf(sc);

    const updated = useAppStore.getState();
    expect(updated.activeWhatIfId).toBe('apiserver-down');
    expect(updated.activeWhatIf).toEqual(sc);

    const apiServerNode = updated.nodes.find((n) => n.id === 'node-apiserver');
    expect(apiServerNode?.data?.status).toBe('error');
  });

  it('clears what-if scenario and restores state', () => {
    const sc = getWhatIfScenario('apiserver-down')!;
    const store = useAppStore.getState();
    store.applyWhatIf(sc);
    store.clearWhatIf();

    const updated = useAppStore.getState();
    expect(updated.activeWhatIfId).toBeNull();
    expect(updated.activeWhatIf).toBeNull();
  });
});
