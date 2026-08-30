import { describe, it, expect } from 'vitest';
import { splitMultiDocYaml } from './multi-doc.ts';

describe('multi-doc', () => {
  it('handles single document without delimiters', () => {
    const yaml = 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: app';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].startLine).toBe(1);
    expect(chunks[0].endLine).toBe(4);
    expect(chunks[0].raw).toBe(yaml);
  });

  it('handles document starting with leading delimiter', () => {
    const yaml = '---\napiVersion: v1\nkind: Service\nmetadata:\n  name: svc';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].startLine).toBe(2);
    expect(chunks[0].endLine).toBe(5);
  });

  it('splits multiple documents separated by triple hyphens', () => {
    const yaml = 'apiVersion: v1\nkind: ConfigMap\n---\napiVersion: v1\nkind: Secret';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].raw).toContain('ConfigMap');
    expect(chunks[1].raw).toContain('Secret');
  });

  it('handles YAML document end marker triple dots', () => {
    const yaml = 'apiVersion: v1\nkind: Pod\n...\napiVersion: v1\nkind: Service';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].raw).toContain('Pod');
    expect(chunks[1].raw).toContain('Service');
  });

  it('handles delimiters with inline comments', () => {
    const yaml = 'apiVersion: v1\nkind: Pod\n--- # Backend Service Follows\napiVersion: v1\nkind: Service';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].raw).toContain('Pod');
    expect(chunks[1].raw).toContain('Service');
  });

  it('filters empty chunks from consecutive delimiters', () => {
    const yaml = '---\n---\napiVersion: v1\nkind: Pod\n---\n---';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].raw).toContain('Pod');
  });

  it('handles Windows CRLF line endings', () => {
    const yaml = 'apiVersion: v1\r\nkind: Pod\r\n---\r\napiVersion: v1\r\nkind: Service';
    const chunks = splitMultiDocYaml(yaml);
    expect(chunks).toHaveLength(2);
  });

  it('returns empty array for empty or whitespace-only input', () => {
    expect(splitMultiDocYaml('')).toHaveLength(0);
    expect(splitMultiDocYaml('   \n\n   ')).toHaveLength(0);
    expect(splitMultiDocYaml('---\n---\n...')).toHaveLength(0);
  });
});
