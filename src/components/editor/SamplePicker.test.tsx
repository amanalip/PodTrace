import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SamplePicker } from './SamplePicker.tsx';
import { useAppStore } from '../../store/index.ts';
import { SAMPLE_LIBRARY } from '../../samples/sample-library.ts';

describe('SamplePicker', () => {
  beforeEach(() => {
    useAppStore.setState({ yaml: '' });
  });

  it('renders sample picker with categories and placeholder', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Load Sample Manifest...')).toBeInTheDocument();
    expect(screen.getByText(/Simple Pod \(Basics\)/i)).toBeInTheDocument();
  });

  it('loads simple-pod sample manifest into store when selected', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    fireEvent.change(select, { target: { value: 'simple-pod' } });

    const sample = SAMPLE_LIBRARY.find((s) => s.id === 'simple-pod');
    expect(useAppStore.getState().yaml).toBe(sample?.yaml);
  });

  it('loads multi-container-pod sample manifest into store when selected', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    fireEvent.change(select, { target: { value: 'multi-container-pod' } });

    const sample = SAMPLE_LIBRARY.find((s) => s.id === 'multi-container-pod');
    expect(useAppStore.getState().yaml).toBe(sample?.yaml);
  });

  it('loads full-stack deployment-service-ingress manifest when selected', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    const fullStack = SAMPLE_LIBRARY.find((s) => s.category === 'Full stack');
    if (fullStack) {
      fireEvent.change(select, { target: { value: fullStack.id } });
      expect(useAppStore.getState().yaml).toBe(fullStack.yaml);
    }
  });

  it('ignores empty selection value without crashing', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    fireEvent.change(select, { target: { value: '' } });
    expect(useAppStore.getState().yaml).toBe('');
  });
});
