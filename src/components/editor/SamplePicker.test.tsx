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

  it('loads sample manifest into store when selected', () => {
    render(<SamplePicker />);

    const select = screen.getByTestId('sample-picker-select');
    fireEvent.change(select, { target: { value: 'simple-pod' } });

    const sample = SAMPLE_LIBRARY.find((s) => s.id === 'simple-pod');
    expect(useAppStore.getState().yaml).toBe(sample?.yaml);
  });
});
