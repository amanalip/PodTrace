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

  it('switches to Mermaid tab and Vector tab with ARIA tablist standards', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('tablist', { name: /export formats/i })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();

    const linkTab = screen.getByRole('tab', { name: /shareable link/i });
    expect(linkTab).toHaveAttribute('aria-selected', 'true');

    const mermaidTab = screen.getByRole('tab', { name: /mermaid markdown/i });
    fireEvent.click(mermaidTab);
    expect(mermaidTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('mermaid-sequence-area')).toBeInTheDocument();
    expect(screen.getByTestId('mermaid-graph-area')).toBeInTheDocument();

    const vectorTab = screen.getByRole('tab', { name: /vector \/ image/i });
    fireEvent.click(vectorTab);
    expect(vectorTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('download-topology-btn')).toBeInTheDocument();
    expect(screen.getByTestId('download-lifecycle-btn')).toBeInTheDocument();
  });

  it('honors initialTab prop when specified as svg', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} initialTab="svg" />);
    expect(screen.getByTestId('download-topology-btn')).toBeInTheDocument();
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(<ExportModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
