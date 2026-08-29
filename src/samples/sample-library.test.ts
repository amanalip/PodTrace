import { describe, it, expect } from 'vitest';
import { SAMPLE_LIBRARY } from './sample-library.ts';
import { parseAndValidateYaml } from '../parser/yaml-parser.ts';

describe('sample-library', () => {
  it('contains registered samples with non-empty identifiers and descriptions', () => {
    expect(SAMPLE_LIBRARY.length).toBeGreaterThanOrEqual(10);

    SAMPLE_LIBRARY.forEach((sample) => {
      expect(sample.id).toBeTruthy();
      expect(sample.name).toBeTruthy();
      expect(sample.category).toBeTruthy();
      expect(sample.description).toBeTruthy();
      expect(sample.yaml.trim().length).toBeGreaterThan(0);
    });
  });

  it('verifies all sample YAML manifests parse successfully without syntax errors', () => {
    SAMPLE_LIBRARY.forEach((sample) => {
      const { resources, errors } = parseAndValidateYaml(sample.yaml);
      expect(errors).toHaveLength(0);
      expect(resources.length, `Failed parsing sample: ${sample.id}`).toBeGreaterThan(0);

      resources.forEach((doc) => {
        expect(doc.kind, `Missing kind in sample ${sample.id}`).toBeTruthy();
        expect(doc.apiVersion, `Missing apiVersion in sample ${sample.id}`).toBeTruthy();
        expect(doc.metadata?.name, `Missing metadata.name in sample ${sample.id}`).toBeTruthy();
      });
    });
  });

  it('includes basic pod and multi-container workloads in Basics category', () => {
    const basics = SAMPLE_LIBRARY.filter((s) => s.category === 'Basics');
    expect(basics.length).toBeGreaterThanOrEqual(2);

    const simplePod = basics.find((s) => s.id === 'simple-pod');
    expect(simplePod).toBeDefined();
    expect(simplePod?.yaml).toContain('nginx');

    const multiContainer = basics.find((s) => s.id === 'multi-container-pod');
    expect(multiContainer).toBeDefined();
    expect(multiContainer?.yaml).toContain('sidecar');
  });

  it('includes deployment workloads with replica definitions', () => {
    const workloads = SAMPLE_LIBRARY.filter((s) => s.category === 'Workloads');
    expect(workloads.length).toBeGreaterThan(0);

    const deploymentSample = workloads.find((s) => s.yaml.includes('kind: Deployment'));
    expect(deploymentSample).toBeDefined();
    expect(deploymentSample?.yaml).toContain('replicas:');
  });

  it('includes service and ingress networking samples', () => {
    const networking = SAMPLE_LIBRARY.filter((s) => s.category === 'Networking');
    expect(networking.length).toBeGreaterThan(0);

    const hasService = networking.some((s) => s.yaml.includes('kind: Service'));
    expect(hasService).toBe(true);
  });

  it('includes config and secrets samples in Config category', () => {
    const configSamples = SAMPLE_LIBRARY.filter((s) => s.category === 'Config');
    expect(configSamples.length).toBeGreaterThan(0);

    const hasConfigOrSecret = configSamples.some(
      (s) => s.yaml.includes('kind: ConfigMap') || s.yaml.includes('kind: Secret')
    );
    expect(hasConfigOrSecret).toBe(true);
  });

  it('includes full-stack multi-document manifests', () => {
    const fullStack = SAMPLE_LIBRARY.filter((s) => s.category === 'Full stack');
    expect(fullStack.length).toBeGreaterThan(0);

    fullStack.forEach((fs) => {
      const { resources, errors } = parseAndValidateYaml(fs.yaml);
      expect(errors).toHaveLength(0);
      expect(resources.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('ensures all sample IDs are unique and hyphen-cased', () => {
    const ids = SAMPLE_LIBRARY.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    ids.forEach((id) => {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    });
  });
});
