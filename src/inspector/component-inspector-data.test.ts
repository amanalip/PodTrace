import { describe, it, expect } from 'vitest';
import { getComponentInspectionData } from './component-inspector-data.ts';

describe('component-inspector-data', () => {
  it('returns data for exact registry keys', () => {
    const apiServer = getComponentInspectionData('apiServerNode');
    expect(apiServer).not.toBeNull();
    expect(apiServer?.binary).toBe('kube-apiserver');

    const etcd = getComponentInspectionData('etcdNode');
    expect(etcd).not.toBeNull();
    expect(etcd?.binary).toBe('etcd');
  });

  it('matches dynamic replica pod nodes with fallback prefix matching', () => {
    const podReplica = getComponentInspectionData('node-pod-deployment-1');
    expect(podReplica).not.toBeNull();
    expect(podReplica?.name).toBe('Pod / Container Group');
    expect(podReplica?.zone).toBe('Worker Node');
  });

  it('matches dynamic worker node agents and runtimes', () => {
    const kubeletNode = getComponentInspectionData('node-kubelet-2');
    expect(kubeletNode).not.toBeNull();
    expect(kubeletNode?.name).toBe('kubelet');

    const runtimeNode = getComponentInspectionData('node-containerruntime-1');
    expect(runtimeNode).not.toBeNull();
    expect(runtimeNode?.binary).toBe('containerd');
  });

  it('returns null for unknown component identifiers', () => {
    const unknown = getComponentInspectionData('random-unknown-node-xyz');
    expect(unknown).toBeNull();
  });
});
