import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell.tsx';

describe('AppShell', () => {
  it('renders standard layout landmarks with accessible labels', () => {
    render(<AppShell />);

    expect(screen.getByRole('banner', { name: /podtrace application header/i })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /yaml editor and scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /kubernetes architecture diagram/i })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /lifecycle explanation and diagnostics/i })).toBeInTheDocument();
  });

  it('renders custom slots when provided', () => {
    render(
      <AppShell
        editorSlot={<div data-testid="custom-editor-slot">Custom Editor</div>}
        canvasSlot={<div data-testid="custom-canvas-slot">Custom Canvas</div>}
        explanationSlot={<div data-testid="custom-explanation-slot">Custom Explanation</div>}
      />
    );

    expect(screen.getByTestId('custom-editor-slot')).toBeInTheDocument();
    expect(screen.getByTestId('custom-canvas-slot')).toBeInTheDocument();
    expect(screen.getByTestId('custom-explanation-slot')).toBeInTheDocument();
  });
});
