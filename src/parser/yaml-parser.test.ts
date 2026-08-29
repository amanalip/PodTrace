import { describe, it, expect } from 'vitest';
import { parseAndValidateYaml } from './yaml-parser.ts';

describe('yaml-parser', () => {
  it('parses valid Pod manifest', () => {
    const yaml = `apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
    - name: nginx
      image: nginx:latest
`;
    const result = parseAndValidateYaml(yaml);
    expect(result.errors).toHaveLength(0);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].kind).toBe('Pod');
    expect(result.resources[0].metadata.name).toBe('test-pod');
  });

  it('parses multi-document YAML manifests separated by ---', () => {
    const yaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-cfg
data:
  KEY: value
---
apiVersion: v1
kind: Service
metadata:
  name: app-svc
spec:
  ports:
    - port: 80
`;
    const result = parseAndValidateYaml(yaml);
    expect(result.errors).toHaveLength(0);
    expect(result.resources).toHaveLength(2);
    expect(result.resources[0].kind).toBe('ConfigMap');
    expect(result.resources[1].kind).toBe('Service');
  });

  it('parses Ingress, Secret, and PVC manifests', () => {
    const yaml = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
spec:
  rules:
    - host: example.com
---
apiVersion: v1
kind: Secret
metadata:
  name: test-secret
data:
  token: dGVzdA==
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-pvc
spec:
  accessModes:
    - ReadWriteOnce
`;
    const result = parseAndValidateYaml(yaml);
    expect(result.errors).toHaveLength(0);
    expect(result.resources).toHaveLength(3);
  });

  it('captures malformed YAML syntax errors with line numbers', () => {
    const badYaml = `apiVersion: v1
kind: Pod
metadata:
  name: [broken yaml indentation
`;
    const result = parseAndValidateYaml(badYaml);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].line).toBeDefined();
    expect(result.errors[0].message).toContain('YAML');
  });

  it('returns empty result for empty string', () => {
    const result = parseAndValidateYaml('   ');
    expect(result.resources).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('handles multi-doc with one valid and one invalid document', () => {
    const mixedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: valid-cm
---
apiVersion: v1
kind: Pod
metadata:
  name: invalid-pod
spec:
  containers: []
`;
    const result = parseAndValidateYaml(mixedYaml);
    expect(result.resources).toHaveLength(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes('at least one container'))).toBe(true);
  });

  it('handles manifests with trailing comments and whitespace', () => {
    const yamlWithComments = `apiVersion: v1 # api version
kind: Service
metadata:
  name: comment-svc
spec:
  ports:
    - port: 80 # default http port
# End of file
`;
    const result = parseAndValidateYaml(yamlWithComments);
    expect(result.errors).toHaveLength(0);
    expect(result.resources[0].metadata.name).toBe('comment-svc');
  });
});
