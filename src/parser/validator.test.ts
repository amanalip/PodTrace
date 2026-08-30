import { describe, it, expect } from 'vitest';
import { validateResource } from './validator.ts';

describe('validator', () => {
  it('detects invalid non-object doc', () => {
    const errors = validateResource(null);
    expect(errors.some((e) => e.message.includes('expected an object definition'))).toBe(true);
  });

  it('detects string primitive doc', () => {
    const errors = validateResource('not-a-yaml-object');
    expect(errors.some((e) => e.message.includes('expected an object definition'))).toBe(true);
  });

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

  it('detects Service port outside 1-65535 range', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'svc' },
      spec: { ports: [{ port: 70000 }] },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('integer between 1 and 65535'))).toBe(true);
  });

  it('detects Deployment with negative replicas', () => {
    const doc = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'deploy' },
      spec: {
        replicas: -2,
        template: { spec: { containers: [{ name: 'app' }] } },
      },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('non-negative integer'))).toBe(true);
  });

  it('detects container name with uppercase or invalid symbols', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'mypod' },
      spec: { containers: [{ name: 'MyContainer_App' }] },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Container name "MyContainer_App" is invalid'))).toBe(true);
  });

  it('detects ExternalName Service without externalName', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'ext-svc' },
      spec: { type: 'ExternalName' },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('ExternalName Service requires spec.externalName'))).toBe(true);
  });

  it('detects ConfigMap with invalid key names', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: 'my-cm' },
      data: { 'invalid key name with spaces!': 'value' },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Invalid key name'))).toBe(true);
  });

  it('detects Secret with invalid key names', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name: 'my-sec' },
      data: { 'bad key@#': 'c2VjcmV0' },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Invalid key name'))).toBe(true);
  });

  it('detects Ingress without rules or defaultBackend', () => {
    const doc = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: { name: 'my-ingress' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Ingress requires spec.rules or spec.defaultBackend'))).toBe(true);
  });

  it('detects HPA without scaleTargetRef', () => {
    const doc = {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: { name: 'my-hpa' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('HPA requires spec.scaleTargetRef'))).toBe(true);
  });

  it('detects Job without template.spec.containers', () => {
    const doc = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: { name: 'my-job' },
      spec: { template: { spec: {} } },
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('Job requires spec.template.spec.containers'))).toBe(true);
  });

  it('detects CronJob without schedule or jobTemplate', () => {
    const doc = {
      apiVersion: 'batch/v1',
      kind: 'CronJob',
      metadata: { name: 'my-cron' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('CronJob requires spec.schedule'))).toBe(true);
  });

  it('detects PVC without accessModes', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: 'my-pvc' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('PVC requires spec.accessModes'))).toBe(true);
  });

  it('detects PV without capacity and accessModes', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: { name: 'my-pv' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('PV requires spec.capacity'))).toBe(true);
  });

  it('detects NetworkPolicy without podSelector', () => {
    const doc = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: { name: 'my-netpol' },
      spec: {},
    };
    const errors = validateResource(doc);
    expect(errors.some((e) => e.message.includes('NetworkPolicy requires spec.podSelector'))).toBe(true);
  });

  it('detects StatefulSet without spec or containers', () => {
    const docWithoutSpec = {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: { name: 'my-sts' },
    };
    expect(validateResource(docWithoutSpec).some((e) => e.message.includes('StatefulSet requires a spec block'))).toBe(true);

    const docWithoutContainers = {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: { name: 'my-sts' },
      spec: { template: { spec: {} } },
    };
    expect(validateResource(docWithoutContainers).some((e) => e.message.includes('StatefulSet requires spec.template.spec.containers'))).toBe(true);
  });

  it('detects DaemonSet without spec or containers', () => {
    const docWithoutSpec = {
      apiVersion: 'apps/v1',
      kind: 'DaemonSet',
      metadata: { name: 'my-ds' },
    };
    expect(validateResource(docWithoutSpec).some((e) => e.message.includes('DaemonSet requires a spec block'))).toBe(true);

    const docWithoutContainers = {
      apiVersion: 'apps/v1',
      kind: 'DaemonSet',
      metadata: { name: 'my-ds' },
      spec: { template: { spec: { containers: [] } } },
    };
    expect(validateResource(docWithoutContainers).some((e) => e.message.includes('DaemonSet requires spec.template.spec.containers'))).toBe(true);
  });

  it('detects Service without spec block', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'empty-svc' },
    };
    expect(validateResource(doc).some((e) => e.message.includes('Service requires a spec block'))).toBe(true);
  });

  it('detects HPA scaleTargetRef missing name or kind property', () => {
    const docMissingName = {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: { name: 'my-hpa' },
      spec: { scaleTargetRef: { kind: 'Deployment' } },
    };
    expect(validateResource(docMissingName).some((e) => e.message.includes('HPA scaleTargetRef requires kind and name'))).toBe(true);
  });

  it('detects Job and CronJob without spec blocks', () => {
    const jobDoc = { apiVersion: 'batch/v1', kind: 'Job', metadata: { name: 'job' } };
    expect(validateResource(jobDoc).some((e) => e.message.includes('Job requires a spec block'))).toBe(true);

    const cronJobDoc = { apiVersion: 'batch/v1', kind: 'CronJob', metadata: { name: 'cron' } };
    expect(validateResource(cronJobDoc).some((e) => e.message.includes('CronJob requires a spec block'))).toBe(true);
  });

  it('correctly calculates line offsets when provided', () => {
    const doc = { apiVersion: 'v1', kind: 'Pod', metadata: { name: 'offset-pod' } };
    const errors = validateResource(doc, 25);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].line).toBe(26);
  });

  it('passes valid Pod manifest with no errors', () => {
    const doc = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'valid-pod' },
      spec: {
        containers: [
          {
            name: 'web',
            image: 'nginx:alpine',
          },
        ],
      },
    };
    const errors = validateResource(doc);
    expect(errors).toHaveLength(0);
  });

  it('passes valid Deployment, Service, and Ingress manifests', () => {
    const deploy = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'web-deploy' },
      spec: {
        replicas: 2,
        template: { spec: { containers: [{ name: 'nginx', image: 'nginx:latest' }] } },
      },
    };
    expect(validateResource(deploy)).toHaveLength(0);

    const svc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'web-svc' },
      spec: {
        ports: [{ port: 80, targetPort: 80 }],
      },
    };
    expect(validateResource(svc)).toHaveLength(0);

    const ing = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: { name: 'web-ing' },
      spec: {
        rules: [{ host: 'example.com' }],
      },
    };
    expect(validateResource(ing)).toHaveLength(0);
  });

  it('passes valid StatefulSet with volumeClaimTemplates', () => {
    const statefulSet = {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: { name: 'db-sts' },
      spec: {
        serviceName: 'db-svc',
        replicas: 3,
        template: {
          spec: {
            containers: [{ name: 'postgres', image: 'postgres:15' }],
          },
        },
      },
    };
    expect(validateResource(statefulSet)).toHaveLength(0);
  });

  it('passes valid DaemonSet manifest', () => {
    const daemonSet = {
      apiVersion: 'apps/v1',
      kind: 'DaemonSet',
      metadata: { name: 'node-exporter' },
      spec: {
        template: {
          spec: {
            containers: [{ name: 'exporter', image: 'prom/node-exporter:v1.6' }],
          },
        },
      },
    };
    expect(validateResource(daemonSet)).toHaveLength(0);
  });

  it('passes valid Job and CronJob manifests', () => {
    const job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: { name: 'db-migrate' },
      spec: {
        template: {
          spec: {
            containers: [{ name: 'migrate', image: 'flyway:latest' }],
          },
        },
      },
    };
    expect(validateResource(job)).toHaveLength(0);

    const cronJob = {
      apiVersion: 'batch/v1',
      kind: 'CronJob',
      metadata: { name: 'nightly-backup' },
      spec: {
        schedule: '0 2 * * *',
        jobTemplate: {
          spec: {
            template: {
              spec: {
                containers: [{ name: 'backup', image: 'backup-runner:v1' }],
              },
            },
          },
        },
      },
    };
    expect(validateResource(cronJob)).toHaveLength(0);
  });

  it('passes valid ConfigMap and Secret manifests', () => {
    const configMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: 'app-props' },
      data: { DB_PORT: '5432' },
    };
    expect(validateResource(configMap)).toHaveLength(0);

    const secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name: 'app-creds' },
      data: { API_KEY: 'c2VjcmV0' },
    };
    expect(validateResource(secret)).toHaveLength(0);
  });

  it('passes valid PersistentVolumeClaim manifest', () => {
    const pvc = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: 'data-pvc' },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '10Gi' } },
      },
    };
    expect(validateResource(pvc)).toHaveLength(0);
  });
});
