import { Node, Edge } from '@xyflow/react';
import { LifecycleStep } from '../model/types.ts';

export function encodeStateToHash(yaml: string, stepIndex: number, theme: string): string {
  try {
    const payload = JSON.stringify({ yaml, step: stepIndex, theme });
    const encoded = btoa(encodeURIComponent(payload));
    return `#data=${encoded}`;
  } catch {
    return '';
  }
}

export function decodeStateFromHash(
  hash: string,
): { yaml?: string; step?: number; theme?: string } | null {
  try {
    if (!hash || !hash.startsWith('#data=')) return null;
    const encoded = hash.replace('#data=', '');
    const decoded = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(decoded);
    return {
      yaml: typeof parsed.yaml === 'string' ? parsed.yaml : undefined,
      step: typeof parsed.step === 'number' ? parsed.step : undefined,
      theme: typeof parsed.theme === 'string' ? parsed.theme : undefined,
    };
  } catch {
    return null;
  }
}

export function generateMermaidSequenceDiagram(steps: LifecycleStep[]): string {
  const lines: string[] = ['sequenceDiagram', '  autonumber'];

  steps.forEach((step) => {
    const from = sanitizeMermaidName(step.sourceNodeId || 'Client');
    const to = sanitizeMermaidName(step.targetNodeId || step.sourceNodeId || 'Cluster');
    const label = step.edgeLabel || step.title;
    lines.push(`  ${from}->>${to}: ${label}`);
  });

  return lines.join('\n');
}

export function generateMermaidGraphDiagram(nodes: Node[], edges: Edge[]): string {
  const lines: string[] = ['graph TD'];

  nodes.forEach((node) => {
    if (node.type?.includes('Zone')) return;
    const id = sanitizeMermaidName(node.id);
    const label = (node.data?.label as string) || node.id;
    lines.push(`  ${id}["${label}"]`);
  });

  edges.forEach((edge) => {
    const from = sanitizeMermaidName(edge.source);
    const to = sanitizeMermaidName(edge.target);
    const label = (edge.data?.label as string) || '';
    if (label) {
      lines.push(`  ${from} -->|"${label}"| ${to}`);
    } else {
      lines.push(`  ${from} --> ${to}`);
    }
  });

  return lines.join('\n');
}

function sanitizeMermaidName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
