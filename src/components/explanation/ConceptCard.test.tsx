import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConceptCard } from './ConceptCard.tsx';
import { ConceptCardData } from '../../model/types.ts';

describe('ConceptCard', () => {
  const sampleConcept: ConceptCardData = {
    id: 'test-concept',
    title: 'What is a Test Component?',
    definition: 'A test component verifies system behavior under controlled circumstances.',
    keyFact: 'Testing ensures regressions are caught before shipping to production.',
    docsUrl: 'https://kubernetes.io/docs/',
  };

  it('renders collapsed title by default', () => {
    render(<ConceptCard concept={sampleConcept} />);
    expect(screen.getByText('What is a Test Component?')).toBeInTheDocument();
    expect(screen.queryByText(/A test component verifies/i)).not.toBeInTheDocument();
  });

  it('expands definition, key fact, and documentation link on click', () => {
    render(<ConceptCard concept={sampleConcept} />);
    const headerBtn = screen.getByRole('button');
    fireEvent.click(headerBtn);

    expect(screen.getByText(/A test component verifies/i)).toBeInTheDocument();
    expect(screen.getByText(/Testing ensures regressions/i)).toBeInTheDocument();
    expect(screen.getByTestId(`concept-body-${sampleConcept.id}`)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /official documentation for what is a test component\?/i });
    expect(link).toHaveAttribute('href', 'https://kubernetes.io/docs/');
  });

  it('syncs initiallyOpen prop when updated and allows copying key fact', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const { rerender } = render(<ConceptCard concept={sampleConcept} initiallyOpen={false} />);
    expect(screen.queryByText(/A test component verifies/i)).not.toBeInTheDocument();

    rerender(<ConceptCard concept={sampleConcept} initiallyOpen={true} />);
    expect(screen.getByText(/A test component verifies/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId(`copy-keyfact-${sampleConcept.id}`);
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleConcept.keyFact);
  });
});
