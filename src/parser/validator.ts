import { ValidationError } from '../model/types.ts';
import { KIND_API_VERSION_MAP } from '../components/editor/k8s-autocomplete.ts';

export const RECOGNIZED_KINDS = new Set([
  'Pod',
  'Deployment',
  'Service',
  'Ingress',
  'ConfigMap',
  'Secret',
  'PersistentVolumeClaim',
  'PersistentVolume',
  'HorizontalPodAutoscaler',
  'StatefulSet',
  'DaemonSet',
  'Job',
  'CronJob',
  'NetworkPolicy',
  'ReplicaSet',
  'Namespace',
]);

export function validateResource(doc: unknown, lineOffset = 0): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!doc || typeof doc !== 'object') {
    errors.push({
      line: lineOffset + 1,
      message: 'Invalid YAML: expected an object definition.',
    });
    return errors;
  }

  const res = doc as Record<string, unknown>;

  // Check apiVersion
  if (!res.apiVersion || typeof res.apiVersion !== 'string') {
    errors.push({
      line: lineOffset + 1,
      field: 'apiVersion',
      message: 'Missing apiVersion field',
    });
  }

  // Check kind
  if (!res.kind || typeof res.kind !== 'string') {
    errors.push({
      line: lineOffset + 1,
      field: 'kind',
      message: 'Missing kind field',
    });
    return errors;
  }

  const kind = res.kind;

  // Check recognized kind
  if (!RECOGNIZED_KINDS.has(kind)) {
    errors.push({
      line: lineOffset + 1,
      field: 'kind',
      message: `Unknown resource type: ${kind}`,
    });
    return errors;
  }

  // Check correct apiVersion for kind
  const expectedApiVersion = KIND_API_VERSION_MAP[kind];
  if (expectedApiVersion && res.apiVersion && res.apiVersion !== expectedApiVersion) {
    // Allow backwards compatibility if standard, otherwise flag warning/error
    errors.push({
      line: lineOffset + 1,
      field: 'apiVersion',
      message: `Wrong apiVersion for ${kind}: expected "${expectedApiVersion}", received "${res.apiVersion}"`,
    });
  }

  // Check metadata and metadata.name
  if (!res.metadata || typeof res.metadata !== 'object') {
    errors.push({
      line: lineOffset + 1,
      field: 'metadata',
      message: 'Every resource needs a name in metadata',
    });
  } else {
    const meta = res.metadata as Record<string, unknown>;
    if (!meta.name || typeof meta.name !== 'string' || !meta.name.trim()) {
      errors.push({
        line: lineOffset + 1,
        field: 'metadata.name',
        message: 'Every resource needs a name in metadata',
      });
    }
  }

  // Kind-specific validations
  const spec = res.spec as Record<string, unknown> | undefined;

  switch (kind) {
    case 'Pod': {
      if (!spec || !Array.isArray(spec.containers) || spec.containers.length === 0) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.containers',
          message: 'Pod requires at least one container in spec.containers',
        });
      } else {
        spec.containers.forEach((container, idx) => {
          if (!container || typeof container !== 'object' || !container.name) {
            errors.push({
              line: lineOffset + 1,
              field: `spec.containers[${idx}].name`,
              message: `Container #${idx + 1} is missing a name`,
            });
          } else if (typeof container.name === 'string' && !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(container.name)) {
            errors.push({
              line: lineOffset + 1,
              field: `spec.containers[${idx}].name`,
              message: `Container name "${container.name}" is invalid: must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character`,
            });
          }
        });
      }
      break;
    }

    case 'Deployment':
    case 'StatefulSet':
    case 'DaemonSet': {
      if (!spec) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec',
          message: `${kind} requires a spec block`,
        });
      } else {
        if (spec.replicas !== undefined && (typeof spec.replicas !== 'number' || spec.replicas < 0 || !Number.isInteger(spec.replicas))) {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.replicas',
            message: 'Replicas must be a non-negative integer',
          });
        }
        const template = spec.template as Record<string, unknown> | undefined;
        const podSpec = template?.spec as Record<string, unknown> | undefined;
        if (!podSpec || !Array.isArray(podSpec.containers) || podSpec.containers.length === 0) {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.template.spec.containers',
            message: `${kind} requires spec.template.spec.containers`,
          });
        }
      }
      break;
    }

    case 'Service': {
      if (!spec) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec',
          message: 'Service requires a spec block',
        });
      } else if (spec.type === 'ExternalName') {
        if (!spec.externalName || typeof spec.externalName !== 'string') {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.externalName',
            message: 'ExternalName Service requires spec.externalName',
          });
        }
      } else if (!Array.isArray(spec.ports) || spec.ports.length === 0) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.ports',
          message: 'Service requires spec.ports to be defined with at least one port',
        });
      } else {
        spec.ports.forEach((p, idx) => {
          if (typeof p === 'object' && p !== null) {
            const portObj = p as Record<string, unknown>;
            if (portObj.port !== undefined) {
              const portNum = Number(portObj.port);
              if (isNaN(portNum) || !Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                errors.push({
                  line: lineOffset + 1,
                  field: `spec.ports[${idx}].port`,
                  message: `Service port must be an integer between 1 and 65535, received "${portObj.port}"`,
                });
              }
            }
          }
        });
      }
      break;
    }

    case 'ConfigMap':
    case 'Secret': {
      const data = res.data as Record<string, unknown> | undefined;
      if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          if (!key.trim() || !/^[a-zA-Z0-9_.-]+$/.test(key)) {
            errors.push({
              line: lineOffset + 1,
              field: `data.${key}`,
              message: `Invalid key name "${key}" in ${kind} data: keys must consist of alphanumeric characters, '-', '_', or '.'`,
            });
          }
        });
      }
      break;
    }

    case 'Ingress': {
      if (!spec || (!Array.isArray(spec.rules) && !spec.defaultBackend)) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.rules',
          message: 'Ingress requires spec.rules or spec.defaultBackend',
        });
      }
      break;
    }

    case 'HorizontalPodAutoscaler': {
      if (!spec || !spec.scaleTargetRef || typeof spec.scaleTargetRef !== 'object') {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.scaleTargetRef',
          message: 'HPA requires spec.scaleTargetRef with name and kind',
        });
      } else {
        const target = spec.scaleTargetRef as Record<string, unknown>;
        if (!target.name || !target.kind) {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.scaleTargetRef',
            message: 'HPA scaleTargetRef requires kind and name',
          });
        }
      }
      break;
    }

    case 'Job': {
      if (!spec) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec',
          message: 'Job requires a spec block',
        });
      } else {
        const template = spec.template as Record<string, unknown> | undefined;
        const podSpec = template?.spec as Record<string, unknown> | undefined;
        if (!podSpec || !Array.isArray(podSpec.containers) || podSpec.containers.length === 0) {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.template.spec.containers',
            message: 'Job requires spec.template.spec.containers',
          });
        }
      }
      break;
    }

    case 'CronJob': {
      if (!spec) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec',
          message: 'CronJob requires a spec block',
        });
      } else {
        if (!spec.schedule || typeof spec.schedule !== 'string') {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.schedule',
            message: 'CronJob requires spec.schedule',
          });
        }
        if (!spec.jobTemplate || typeof spec.jobTemplate !== 'object') {
          errors.push({
            line: lineOffset + 1,
            field: 'spec.jobTemplate',
            message: 'CronJob requires spec.jobTemplate',
          });
        }
      }
      break;
    }

    case 'PersistentVolumeClaim': {
      if (!spec || !Array.isArray(spec.accessModes) || spec.accessModes.length === 0) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.accessModes',
          message: 'PVC requires spec.accessModes',
        });
      }
      break;
    }

    case 'PersistentVolume': {
      if (
        !spec ||
        !spec.capacity ||
        !Array.isArray(spec.accessModes) ||
        spec.accessModes.length === 0
      ) {
        errors.push({
          line: lineOffset + 1,
          field: 'spec',
          message: 'PV requires spec.capacity and non-empty spec.accessModes',
        });
      }
      break;
    }

    case 'NetworkPolicy': {
      if (!spec || !spec.podSelector || typeof spec.podSelector !== 'object') {
        errors.push({
          line: lineOffset + 1,
          field: 'spec.podSelector',
          message: 'NetworkPolicy requires spec.podSelector',
        });
      }
      break;
    }
  }

  return errors;
}
