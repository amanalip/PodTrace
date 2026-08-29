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
    let encoded = hash.replace('#data=', '').trim();
    if (!encoded) return null;

    // Pad base64 string if necessary
    while (encoded.length % 4 !== 0) {
      encoded += '=';
    }

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

export function generateDiagramExportJSON(
  yaml: string,
  stepIndex: number,
  steps: LifecycleStep[],
  nodes: Node[],
  edges: Edge[],
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'PodTrace',
      stepIndex,
      manifest: yaml,
      steps,
      nodes,
      edges,
    },
    null,
    2,
  );
}

export function generateMermaidSequenceDiagram(steps: LifecycleStep[]): string {
  const lines: string[] = ['sequenceDiagram', '  autonumber'];

  steps.forEach((step) => {
    const from = sanitizeMermaidName(step.sourceNodeId || 'Client');
    const to = sanitizeMermaidName(step.targetNodeId || step.sourceNodeId || 'Cluster');
    const rawLabel = step.edgeLabel || step.title;
    const label = rawLabel.replace(/"/g, "'").replace(/[#;]/g, '');
    lines.push(`  ${from}->>${to}: ${label}`);
  });

  return lines.join('\n');
}

export function generateMermaidGraphDiagram(nodes: Node[], edges: Edge[]): string {
  const lines: string[] = ['graph TD'];

  const validNodeIds = new Set(
    nodes.filter((n) => !n.type?.includes('Zone')).map((n) => n.id),
  );

  nodes.forEach((node) => {
    if (node.type?.includes('Zone')) return;
    const id = sanitizeMermaidName(node.id);
    const rawLabel = (node.data?.label as string) || node.id;
    const label = rawLabel.replace(/"/g, "'").replace(/[\][]/g, '');
    lines.push(`  ${id}["${label}"]`);
  });

  edges.forEach((edge) => {
    if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target)) return;
    const from = sanitizeMermaidName(edge.source);
    const to = sanitizeMermaidName(edge.target);
    const rawLabel = (edge.data?.label as string) || '';
    const label = rawLabel.replace(/"/g, "'").replace(/[\][]/g, '');
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
  const fullMime = mimeType.includes('charset') ? mimeType : `${mimeType};charset=utf-8`;
  const blob = new Blob([content], { type: fullMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
