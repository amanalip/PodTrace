import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationPanel } from './ValidationPanel.tsx';
import { useAppStore } from '../../store/index.ts';

describe('ValidationPanel', () => {
  beforeEach(() => {
    useAppStore.setState({ validationErrors: [] });
  });

  it('renders nothing when there are no errors', () => {
    const { container } = render(<ValidationPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders list of validation errors with line numbers', () => {
    useAppStore.setState({
      validationErrors: [
        { message: 'Missing metadata.name in Pod spec', line: 5 },
        { message: 'Invalid API version', line: 1 },
      ],
    });

    render(<ValidationPanel />);
    expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
    expect(screen.getByText('Validation Issues (2)')).toBeInTheDocument();
    expect(screen.getByText('Missing metadata.name in Pod spec')).toBeInTheDocument();
    expect(screen.getByText('L5')).toBeInTheDocument();
    expect(screen.getByText('L1')).toBeInTheDocument();
  });

  it('toggles collapse and expand on header click', () => {
    useAppStore.setState({
      validationErrors: [{ message: 'Syntax error in YAML', line: 3 }],
    });

    render(<ValidationPanel />);
    expect(screen.getByText('Syntax error in YAML')).toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: /collapse validation issues/i });
    fireEvent.click(collapseBtn);

    expect(screen.queryByText('Syntax error in YAML')).not.toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: /expand validation issues/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Syntax error in YAML')).toBeInTheDocument();
  });

  it('toggles collapse via keyboard Enter on header and checks aria-expanded', () => {
    useAppStore.setState({
      validationErrors: [{ message: 'Syntax error in YAML', line: 3 }],
    });

    render(<ValidationPanel />);
    const headerBtn = screen.getByRole('button', { name: /collapse validation issues/i });
    expect(headerBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(headerBtn, { key: 'Enter' });
    expect(screen.queryByText('Syntax error in YAML')).not.toBeInTheDocument();
  });

  it('handles validation error item without line number cleanly', () => {
    useAppStore.setState({
      validationErrors: [{ message: 'Global schema error' }],
    });

    render(<ValidationPanel />);
    expect(screen.getByText('Validation Issues (1)')).toBeInTheDocument();
    expect(screen.getByText('Global schema error')).toBeInTheDocument();
    expect(screen.queryByText(/^L/)).not.toBeInTheDocument();
  });

  it('toggles collapse via keyboard Space on header button', () => {
    useAppStore.setState({
      validationErrors: [{ message: 'Port value out of range', line: 8 }],
    });

    render(<ValidationPanel />);
    const headerBtn = screen.getByRole('button', { name: /collapse validation issues/i });
    fireEvent.keyDown(headerBtn, { key: ' ' });

    expect(screen.queryByText('Port value out of range')).not.toBeInTheDocument();
  });
});
