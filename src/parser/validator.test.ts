import { describe, it, expect } from 'vitest';
import { validateResource } from './validator.ts';

describe('validator', () => {
  it('detects missing apiVersion', () => {
    const doc = { kind: 'Pod', metadata: { name: 'test' }, spec: { containers: [{ name: 'c1' }] } };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message === 'Missing apiVersion field')).toBe(true);
  });

  it('detects missing kind', () => {
    const doc = { apiVersion: 'v1', metadata: { name: 'test' } };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message === 'Missing kind field')).toBe(true);
  });

  it('detects unknown kind', () => {
    const doc = { apiVersion: 'v1', kind: 'FooBar', metadata: { name: 'test' } };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message === 'Unknown resource type: FooBar')).toBe(true);
  });

  it('detects wrong apiVersion for kind', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Deployment',
      metadata: { name: 'deploy' },
      spec: { template: { spec: { containers: [{ name: 'app' }] } } },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Wrong apiVersion for Deployment'))).toBe(true);
  });

  it('detects missing metadata name', () => {
    const doc = { apiVersion: 'v1', kind: 'Pod', metadata: {} };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message === 'Every resource needs a name in metadata')).toBe(true);
  });

  it('detects Pod without containers in spec', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'empty-pod' },
      spec: { containers: [] },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Pod requires at least one container'))).toBe(true);
  });

  it('detects Service without ports', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'svc' },
      spec: { ports: [] },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Service requires spec.ports'))).toBe(true);
  });
});
