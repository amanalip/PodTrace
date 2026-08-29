import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';

export const KIND_API_VERSION_MAP: Record<string, string> = {
  Pod: 'v1',
  Service: 'v1',
  ConfigMap: 'v1',
  Secret: 'v1',
  PersistentVolumeClaim: 'v1',
  PersistentVolume: 'v1',
  Namespace: 'v1',
  Deployment: 'apps/v1',
  StatefulSet: 'apps/v1',
  DaemonSet: 'apps/v1',
  ReplicaSet: 'apps/v1',
  Job: 'batch/v1',
  CronJob: 'batch/v1',
  Ingress: 'networking.k8s.io/v1',
  NetworkPolicy: 'networking.k8s.io/v1',
  HorizontalPodAutoscaler: 'autoscaling/v2',
};

export const ROOT_KEYS: Completion[] = [
  { label: 'apiVersion', type: 'keyword', detail: 'K8s API Version', apply: 'apiVersion: ' },
  { label: 'kind', type: 'keyword', detail: 'Resource Kind', apply: 'kind: ' },
  { label: 'metadata', type: 'keyword', detail: 'Resource Metadata', apply: 'metadata:\n  name: ' },
  { label: 'spec', type: 'keyword', detail: 'Resource Specification', apply: 'spec:\n  ' },
  { label: 'data', type: 'keyword', detail: 'ConfigMap/Secret Data', apply: 'data:\n  ' },
];

export const KIND_COMPLETIONS: Completion[] = Object.keys(KIND_API_VERSION_MAP).map((kind) => ({
  label: kind,
  type: 'type',
  detail: `apiVersion: ${KIND_API_VERSION_MAP[kind]}`,
  apply: kind,
}));

export const METADATA_KEYS: Completion[] = [
  { label: 'name', type: 'property', detail: 'Resource name', apply: 'name: ' },
  { label: 'namespace', type: 'property', detail: 'Target namespace', apply: 'namespace: ' },
  { label: 'labels', type: 'property', detail: 'Key-value label pairs', apply: 'labels:\n    app: ' },
  { label: 'annotations', type: 'property', detail: 'Metadata annotations', apply: 'annotations:\n    ' },
];

export const SPEC_KEYS: Completion[] = [
  { label: 'containers', type: 'property', detail: 'Pod container list', apply: 'containers:\n    - name: \n      image: ' },
  { label: 'initContainers', type: 'property', detail: 'Init container list', apply: 'initContainers:\n    - name: \n      image: ' },
  { label: 'replicas', type: 'property', detail: 'Desired replica count', apply: 'replicas: ' },
  { label: 'selector', type: 'property', detail: 'Label selector', apply: 'selector:\n    matchLabels:\n      app: ' },
  { label: 'template', type: 'property', detail: 'Pod template spec', apply: 'template:\n    metadata:\n      labels:\n        app: \n    spec:\n      containers:\n        - name: \n          image: ' },
  { label: 'ports', type: 'property', detail: 'Port mappings', apply: 'ports:\n    - port: 80\n      targetPort: 80' },
  { label: 'type', type: 'property', detail: 'Service type', apply: 'type: ClusterIP' },
  { label: 'rules', type: 'property', detail: 'Ingress routing rules', apply: 'rules:\n    - http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: \n                port:\n                  number: 80' },
  { label: 'volumes', type: 'property', detail: 'Pod volume declarations', apply: 'volumes:\n    - name: \n      emptyDir: {}' },
  { label: 'schedule', type: 'property', detail: 'Cron schedule expression', apply: 'schedule: "*/5 * * * *"' },
  { label: 'jobTemplate', type: 'property', detail: 'CronJob template spec', apply: 'jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n            - name: \n              image: ' },
  { label: 'accessModes', type: 'property', detail: 'PVC access modes', apply: 'accessModes:\n    - ReadWriteOnce' },
  { label: 'resources', type: 'property', detail: 'Resource requests/limits', apply: 'resources:\n    requests:\n      cpu: 100m\n      memory: 128Mi' },
  { label: 'scaleTargetRef', type: 'property', detail: 'HPA target resource', apply: 'scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: ' },
];

export const CONTAINER_KEYS: Completion[] = [
  { label: 'name', type: 'property', detail: 'Container name', apply: 'name: ' },
  { label: 'image', type: 'property', detail: 'Container image', apply: 'image: ' },
  { label: 'ports', type: 'property', detail: 'Container exposed ports', apply: 'ports:\n        - containerPort: ' },
  { label: 'env', type: 'property', detail: 'Environment variables', apply: 'env:\n        - name: \n          value: ' },
  { label: 'volumeMounts', type: 'property', detail: 'Mounted volume paths', apply: 'volumeMounts:\n        - name: \n          mountPath: ' },
  { label: 'command', type: 'property', detail: 'Entrypoint command array', apply: 'command: []' },
  { label: 'args', type: 'property', detail: 'Command arguments array', apply: 'args: []' },
  { label: 'resources', type: 'property', detail: 'Container resources', apply: 'resources:\n        requests:\n          cpu: 100m\n          memory: 128Mi' },
];

export function getCompletionsForContext(
  lineText: string,
  indent: number,
  previousLines: string[],
): Completion[] {
  const trimmed = lineText.trim();

  // If typing after "kind:"
  if (trimmed.startsWith('kind:')) {
    return KIND_COMPLETIONS;
  }

  // If typing after "apiVersion:"
  if (trimmed.startsWith('apiVersion:')) {
    const uniqueVersions = Array.from(new Set(Object.values(KIND_API_VERSION_MAP)));
    return uniqueVersions.map((ver) => ({
      label: ver,
      type: 'value',
      detail: 'API version',
      apply: ver,
    }));
  }

  // Find parent context by scanning backward
  let parentContext = '';
  for (let i = previousLines.length - 1; i >= 0; i--) {
    const prev = previousLines[i];
    const prevTrimmed = prev.trim();
    if (!prevTrimmed || prevTrimmed.startsWith('#')) {
      continue;
    }
    const prevIndent = prev.search(/\S/);
    if (prevIndent !== -1 && prevIndent < indent) {
      if (prevTrimmed.startsWith('metadata:')) {
        parentContext = 'metadata';
        break;
      } else if (prevTrimmed.startsWith('containers:') || prevTrimmed.startsWith('- name:')) {
        parentContext = 'containers';
        break;
      } else if (prevTrimmed.startsWith('spec:')) {
        parentContext = 'spec';
        break;
      }
    }
  }

  if (indent === 0) {
    return ROOT_KEYS;
  }

  if (parentContext === 'metadata') {
    return METADATA_KEYS;
  }

  if (parentContext === 'containers') {
    return CONTAINER_KEYS;
  }

  if (parentContext === 'spec') {
    return SPEC_KEYS;
  }

  return [...ROOT_KEYS, ...SPEC_KEYS];
}

export function k8sCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[\w\-:]*/);
  if (!word && !context.explicit) return null;

  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text.slice(0, context.pos - line.from);
  const indent = line.text.search(/\S/);
  const actualIndent = indent === -1 ? lineText.length : indent;

  const previousLines: string[] = [];
  for (let i = 1; i < line.number; i++) {
    previousLines.push(context.state.doc.line(i).text);
  }

  const options = getCompletionsForContext(lineText, actualIndent, previousLines);

  const colonIndex = lineText.indexOf(':');
  let fromPos = word ? word.from : context.pos;

  if (colonIndex !== -1 && context.pos > line.from + colonIndex) {
    const valueMatch = context.matchBefore(/[\w\-.:/]*/);
    fromPos = valueMatch ? valueMatch.from : context.pos;
  }

  return {
    from: fromPos,
    options,
    validFor: /^[\w\-.:/]*$/,
  };
}
