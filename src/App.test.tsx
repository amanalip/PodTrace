import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.tsx';

describe('App', () => {
  it('renders app shell with header and default panels', () => {
    render(<App />);

    expect(screen.getByText('PodTrace')).toBeInTheDocument();
    expect(
      screen.getByText('Trace every step, from apply to running'),
    ).toBeInTheDocument();
    expect(screen.getByText('YAML Manifest')).toBeInTheDocument();
    expect(screen.getByText('Lifecycle Explanation')).toBeInTheDocument();
  });
});
