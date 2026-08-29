import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { YAMLEditor } from './YAMLEditor.tsx';
import { useAppStore } from '../../store/index.ts';
import { DEFAULT_SAMPLE_YAML } from '../../model/constants.ts';

describe('YAMLEditor', () => {
  beforeEach(() => {
    useAppStore.setState({ yaml: DEFAULT_SAMPLE_YAML });
  });

  it('renders editor container and toolbar', () => {
    render(<YAMLEditor />);

    expect(screen.getByText('Manifest Source')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(screen.getByTestId('yaml-editor-container')).toBeInTheDocument();
  });

  it('renders default sample YAML from store', () => {
    render(<YAMLEditor />);

    const currentYaml = useAppStore.getState().yaml;
    expect(currentYaml).toContain('kind: Pod');
    expect(currentYaml).toContain('name: nginx-pod');
  });

  it('updates editor when store yaml changes externally', () => {
    render(<YAMLEditor />);

    const customYaml = 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\n';
    act(() => {
      useAppStore.getState().setYaml(customYaml);
    });

    expect(useAppStore.getState().yaml).toBe(customYaml);
  });

  it('formats YAML on format button click', () => {
    const unformattedYaml = 'apiVersion:  v1\nkind:   Pod\nmetadata:\n  name: test';
    useAppStore.setState({ yaml: unformattedYaml });

    render(<YAMLEditor />);

    const formatBtn = screen.getByRole('button', { name: /format/i });
    fireEvent.click(formatBtn);

    const formattedYaml = useAppStore.getState().yaml;
    expect(formattedYaml).toContain('kind: Pod');
  });

  it('copies YAML to clipboard when copy button is clicked', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<YAMLEditor />);

    const copyBtn = screen.getByTestId('copy-yaml-btn');
    expect(copyBtn).toHaveAttribute('aria-live', 'polite');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
