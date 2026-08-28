import jsyaml from 'js-yaml';
import { K8sResource, ValidationError } from '../model/types.ts';
import { splitMultiDocYaml } from './multi-doc.ts';
import { validateResource } from './validator.ts';

export interface ParseResult {
  resources: K8sResource[];
  errors: ValidationError[];
}

export function parseAndValidateYaml(rawYaml: string): ParseResult {
  const trimmed = rawYaml.trim();
  if (!trimmed) {
    return { resources: [], errors: [] };
  }

  const chunks = splitMultiDocYaml(rawYaml);
  const resources: K8sResource[] = [];
  const errors: ValidationError[] = [];

  for (const chunk of chunks) {
    try {
      const doc = jsyaml.load(chunk.raw);
      if (!doc) continue;

      const docErrors = validateResource(doc, chunk.startLine - 1);
      if (docErrors.length > 0) {
        errors.push(...docErrors);
      } else {
        resources.push(doc as K8sResource);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'mark' in err) {
        const mark = (err as { mark?: { line?: number; column?: number } }).mark;
        const line = (mark?.line ?? 0) + chunk.startLine;
        const reason = (err as { reason?: string }).reason || 'YAML syntax error';
        errors.push({
          line,
          message: `YAML parsing error: ${reason}`,
        });
      } else {
        errors.push({
          line: chunk.startLine,
          message: 'Malformed YAML document',
        });
      }
    }
  }

  return { resources, errors };
}
