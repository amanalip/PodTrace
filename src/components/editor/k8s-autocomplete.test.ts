import { describe, it, expect } from 'vitest';
import {
  getCompletionsForContext,
  ROOT_KEYS,
  KIND_COMPLETIONS,
  METADATA_KEYS,
  CONTAINER_KEYS,
  SPEC_KEYS,
  KIND_API_VERSION_MAP,
} from './k8s-autocomplete.ts';

describe('k8s-autocomplete', () => {
  it('returns root keys at indent 0', () => {
    const completions = getCompletionsForContext('', 0, []);
    expect(completions).toEqual(ROOT_KEYS);
    expect(completions.some((c) => c.label === 'apiVersion')).toBe(true);
    expect(completions.some((c) => c.label === 'kind')).toBe(true);
    expect(completions.some((c) => c.label === 'spec')).toBe(true);
  });

  it('returns kind completions when typing kind:', () => {
    const completions = getCompletionsForContext('kind: ', 0, []);
    expect(completions).toEqual(KIND_COMPLETIONS);
    expect(completions.some((c) => c.label === 'Pod')).toBe(true);
    expect(completions.some((c) => c.label === 'Deployment')).toBe(true);
    expect(completions.some((c) => c.label === 'Service')).toBe(true);
    expect(completions.some((c) => c.label === 'Ingress')).toBe(true);
    expect(completions.some((c) => c.label === 'ConfigMap')).toBe(true);
    expect(completions.some((c) => c.label === 'Secret')).toBe(true);
  });

  it('returns metadata keys when indented under metadata:', () => {
    const previousLines = ['apiVersion: v1', 'kind: Pod', 'metadata:'];
    const completions = getCompletionsForContext('  ', 2, previousLines);
    expect(completions).toEqual(METADATA_KEYS);
    expect(completions.some((c) => c.label === 'name')).toBe(true);
    expect(completions.some((c) => c.label === 'namespace')).toBe(true);
    expect(completions.some((c) => c.label === 'labels')).toBe(true);
    expect(completions.some((c) => c.label === 'annotations')).toBe(true);
  });

  it('returns container keys when indented under containers:', () => {
    const previousLines = [
      'apiVersion: v1',
      'kind: Pod',
      'spec:',
      '  containers:',
      '    - name: app',
    ];
    const completions = getCompletionsForContext('      ', 6, previousLines);
    expect(completions).toEqual(CONTAINER_KEYS);
    expect(completions.some((c) => c.label === 'name')).toBe(true);
    expect(completions.some((c) => c.label === 'image')).toBe(true);
    expect(completions.some((c) => c.label === 'ports')).toBe(true);
    expect(completions.some((c) => c.label === 'env')).toBe(true);
    expect(completions.some((c) => c.label === 'volumeMounts')).toBe(true);
    expect(completions.some((c) => c.label === 'resources')).toBe(true);
  });

  it('returns spec keys when indented under spec:', () => {
    const previousLines = ['apiVersion: apps/v1', 'kind: Deployment', 'spec:'];
    const completions = getCompletionsForContext('  ', 2, previousLines);
    expect(completions).toEqual(SPEC_KEYS);
    expect(completions.some((c) => c.label === 'replicas')).toBe(true);
    expect(completions.some((c) => c.label === 'containers')).toBe(true);
    expect(completions.some((c) => c.label === 'selector')).toBe(true);
    expect(completions.some((c) => c.label === 'template')).toBe(true);
  });

  it('ignores comments when scanning backward for parent blocks', () => {
    const previousLines = [
      'apiVersion: v1',
      'kind: Pod',
      'metadata:',
      '  # This is a comment',
      '  name: my-app',
      '  # Another comment',
    ];
    const completions = getCompletionsForContext('  ', 2, previousLines);
    expect(completions).toEqual(METADATA_KEYS);
    expect(completions.some((c) => c.label === 'namespace')).toBe(true);
  });

  it('returns API versions when typing apiVersion:', () => {
    const completions = getCompletionsForContext('apiVersion: ', 0, []);
    expect(completions.some((c) => c.label === 'v1')).toBe(true);
    expect(completions.some((c) => c.label === 'apps/v1')).toBe(true);
    expect(completions.some((c) => c.label === 'networking.k8s.io/v1')).toBe(true);
    expect(completions.some((c) => c.label === 'batch/v1')).toBe(true);
  });

  it('maps all recognized kinds to standard API versions', () => {
    expect(KIND_API_VERSION_MAP.Pod).toBe('v1');
    expect(KIND_API_VERSION_MAP.Deployment).toBe('apps/v1');
    expect(KIND_API_VERSION_MAP.Service).toBe('v1');
    expect(KIND_API_VERSION_MAP.Ingress).toBe('networking.k8s.io/v1');
    expect(KIND_API_VERSION_MAP.HorizontalPodAutoscaler).toBe('autoscaling/v2');
  });

  it('returns combined fallback options for unknown non-zero indentation', () => {
    const previousLines = ['foo: bar'];
    const completions = getCompletionsForContext('    ', 4, previousLines);
    expect(completions.some((c) => c.label === 'apiVersion')).toBe(true);
    expect(completions.some((c) => c.label === 'containers')).toBe(true);
  });
});
