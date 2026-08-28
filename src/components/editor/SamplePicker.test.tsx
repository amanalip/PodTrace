import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SamplePicker } from './SamplePicker.tsx';
import { useAppStore } from '../../store/index.ts';

describe('SamplePicker', () => {
  it('renders all sample categories in dropdown', () => {
    render(<SamplePicker />);

    expect(screen.getByRole('combobox', { name: /select sample manifest/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Basics' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Workloads' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Networking' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Config' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Scaling' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Full stack' })).toBeInTheDocument();
  });

  it('updates store yaml when a different sample is selected', () => {
    render(<SamplePicker />);

    const select = screen.getByRole('combobox', { name: /select sample manifest/i });
    fireEvent.change(select, { target: { value: 'deployment' } });

    const currentYaml = useAppStore.getState().yaml;
    expect(currentYaml).toContain('kind: Deployment');
    expect(currentYaml).toContain('frontend-deployment');
  });
});
