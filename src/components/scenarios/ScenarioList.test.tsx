import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioList } from './ScenarioList.tsx';

describe('ScenarioList', () => {
  it('renders all scenarios by default and filters by category', () => {
    render(<ScenarioList />);

    // Default contains CrashLoopBackOff and Insufficient CPU
    expect(screen.getByText('CrashLoopBackOff on Startup')).toBeInTheDocument();
    expect(screen.getByText('Pending: Insufficient CPU')).toBeInTheDocument();

    // Click on "Scheduling" category
    const schedulingPill = screen.getByRole('button', { name: /Scheduling/i });
    fireEvent.click(schedulingPill);

    expect(screen.getByText('Pending: Insufficient CPU')).toBeInTheDocument();
    expect(screen.queryByText('CrashLoopBackOff on Startup')).not.toBeInTheDocument();
  });

  it('filters scenarios by search query and opens scenario detail on card click', () => {
    render(<ScenarioList />);

    const searchInput = screen.getByPlaceholderText(/search scenarios/i);
    fireEvent.change(searchInput, { target: { value: 'OOMKilled' } });

    expect(screen.getByText('OOMKilled (Out Of Memory)')).toBeInTheDocument();
    expect(screen.queryByText('CrashLoopBackOff on Startup')).not.toBeInTheDocument();

    // Click on the OOMKilled card
    fireEvent.click(screen.getByTestId('scenario-card-oomkilled'));

    // Should render ScenarioDetail
    expect(screen.getByTestId('scenario-detail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start scenario/i })).toBeInTheDocument();
  });
});
