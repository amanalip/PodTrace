import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index.ts';

describe('editorSlice in useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      yaml: '',
      parsedResources: [],
      validationErrors: [],
    });
  });

  it('updates yaml string in store', () => {
    const store = useAppStore.getState();
    const validPodYaml = `apiVersion: v1
kind: Pod
metadata:
  name: test-editor-pod
`;
    store.setYaml(validPodYaml);

    const updated = useAppStore.getState();
    expect(updated.yaml).toBe(validPodYaml);
  });

  it('updates parsedResources and validationErrors', () => {
    const store = useAppStore.getState();
    store.setParsedResources([
      {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'pod-1' },
      },
    ]);
    store.setValidationErrors([{ line: 1, message: 'Sample error' }]);

    const updated = useAppStore.getState();
    expect(updated.parsedResources).toHaveLength(1);
    expect(updated.parsedResources[0].metadata?.name).toBe('pod-1');
    expect(updated.validationErrors).toHaveLength(1);
    expect(updated.validationErrors[0].message).toBe('Sample error');
  });
});
