import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './ExportModal.tsx';
import { useAppStore } from '../../store/index.ts';

describe('ExportModal', () => {
  beforeEach(() => {
    useAppStore.setState({
      yaml: 'apiVersion: v1\nkind: Pod',
      currentStepIndex: 1,
      theme: 'dark',
      steps: [],
      nodes: [],
      edges: [],
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ExportModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders link tab and copies URL when opened', async () => {
    const onClose = vi.fn();
    render(<ExportModal isOpen={true} onClose={onClose} />);

    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByTestId('share-url-input')).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-link-btn');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('switches to Mermaid tab and Vector tab', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} />);

    const mermaidTab = screen.getByRole('button', { name: /mermaid markdown/i });
    fireEvent.click(mermaidTab);
    expect(screen.getByTestId('mermaid-sequence-area')).toBeInTheDocument();
    expect(screen.getByTestId('mermaid-graph-area')).toBeInTheDocument();

    const vectorTab = screen.getByRole('button', { name: /vector \/ image/i });
    fireEvent.click(vectorTab);
    expect(screen.getByTestId('download-topology-btn')).toBeInTheDocument();
    expect(screen.getByTestId('download-lifecycle-btn')).toBeInTheDocument();
  });

  it('honors initialTab prop when specified as svg', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} initialTab="svg" />);
    expect(screen.getByTestId('download-topology-btn')).toBeInTheDocument();
  });
});
