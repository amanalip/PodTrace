import { describe, it, expect } from 'vitest';
import { getLifecycleStepsForResources } from './steps.ts';
import { K8sResource } from '../model/types.ts';

describe('steps router', () => {
  it('returns Pod lifecycle steps when given a Pod resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'my-app' },
        spec: { containers: [{ name: 'app', image: 'app:1.0' }] },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps).toHaveLength(9);
    expect(steps[0].edgeLabel).toContain('my-app.yaml');
  });

  it('returns default pod lifecycle steps when empty', () => {
    const steps = getLifecycleStepsForResources([]);
    expect(steps).toHaveLength(9);
    expect(steps[0].edgeLabel).toContain('nginx-pod.yaml');
  });

  it('returns Deployment lifecycle steps when given a Deployment resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'web-deploy' },
        spec: { replicas: 3 },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].title).toContain('Deployment');
  });

  it('returns Service lifecycle steps when given a Service resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: 'web-service' },
        spec: { type: 'NodePort', clusterIP: '10.96.0.100' },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.what.includes('web-service'))).toBe(true);
  });

  it('returns Ingress lifecycle steps when given an Ingress resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: { name: 'web-ingress' },
        spec: {
          rules: [
            {
              host: 'example.com',
              http: {
                paths: [
                  {
                    path: '/api',
                    backend: {
                      service: { name: 'api-service' },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.what.includes('example.com'))).toBe(true);
  });

  it('returns ConfigMap lifecycle steps when given a ConfigMap resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'app-config' },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.what.includes('app-config'))).toBe(true);
  });

  it('returns Secret lifecycle steps when given a Secret resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: 'app-secret' },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.what.includes('app-secret'))).toBe(true);
  });

  it('returns PVC lifecycle steps when given a PersistentVolumeClaim resource', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name: 'app-pvc' },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.what.includes('app-pvc'))).toBe(true);
  });

  it('returns Composite lifecycle steps when given multiple resources', () => {
    const resources: K8sResource[] = [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'my-deploy' },
      },
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: 'my-svc' },
      },
    ];

    const steps = getLifecycleStepsForResources(resources);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.title.includes('Multi-Resource') || s.what.includes('resources'))).toBe(true);
  });
});
