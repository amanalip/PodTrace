import { describe, it, expect } from 'vitest';
import {
  getComponentInspectionData,
  COMPONENT_INSPECTOR_REGISTRY,
} from './component-inspector-data.ts';

describe('component-inspector-data', () => {
  it('returns data for exact registry keys', () => {
    const apiServer = getComponentInspectionData('apiServerNode');
    expect(apiServer).not.toBeNull();
    expect(apiServer?.binary).toBe('kube-apiserver');

    const etcd = getComponentInspectionData('etcdNode');
    expect(etcd).not.toBeNull();
    expect(etcd?.binary).toBe('etcd');

    const scheduler = getComponentInspectionData('schedulerNode');
    expect(scheduler).not.toBeNull();
    expect(scheduler?.binary).toBe('kube-scheduler');

    const cm = getComponentInspectionData('controllerManagerNode');
    expect(cm).not.toBeNull();
    expect(cm?.binary).toBe('kube-controller-manager');

    const kubelet = getComponentInspectionData('kubeletNode');
    expect(kubelet).not.toBeNull();
    expect(kubelet?.binary).toBe('kubelet');

    const runtime = getComponentInspectionData('containerRuntimeNode');
    expect(runtime).not.toBeNull();
    expect(runtime?.binary).toBe('containerd');

    const proxy = getComponentInspectionData('kubeProxyNode');
    expect(proxy).not.toBeNull();
    expect(proxy?.binary).toBe('kube-proxy');

    const pod = getComponentInspectionData('podNode');
    expect(pod).not.toBeNull();
    expect(pod?.name).toBe('Pod / Container Group');

    const kubectl = getComponentInspectionData('kubectlNode');
    expect(kubectl).not.toBeNull();
    expect(kubectl?.binary).toBe('kubectl');

    const user = getComponentInspectionData('userNode');
    expect(user).not.toBeNull();
    expect(user?.name).toBe('Developer / Client');
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

    const proxyNode = getComponentInspectionData('node-kubeproxy-2');
    expect(proxyNode).not.toBeNull();
    expect(proxyNode?.binary).toBe('kube-proxy');
  });

  it('verifies all registry components have complete documentation and metrics', () => {
    Object.entries(COMPONENT_INSPECTOR_REGISTRY).forEach(([key, comp]) => {
      expect(comp.name, `Missing name for ${key}`).toBeTruthy();
      expect(comp.binary, `Missing binary for ${key}`).toBeTruthy();
      expect(comp.role, `Missing role for ${key}`).toBeTruthy();
      expect(comp.zone, `Missing zone for ${key}`).toBeTruthy();
      expect(comp.responsibilities.length, `Missing responsibilities for ${key}`).toBeGreaterThan(0);
      expect(Array.isArray(comp.failureModes), `Invalid failureModes for ${key}`).toBe(true);
      expect(comp.debugCommands.length, `Missing debugCommands for ${key}`).toBeGreaterThan(0);
      expect(comp.githubUrl, `Missing githubUrl for ${key}`).toBeTruthy();
    });
  });

  it('returns null for unknown component identifiers', () => {
    const unknown = getComponentInspectionData('random-unknown-node-xyz');
    expect(unknown).toBeNull();
  });
});
