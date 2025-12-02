import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';
import { UserProfile, PlanDetails } from '../types';

describe('Dashboard', () => {
  const mockUserProfile: UserProfile = {
    credits: 50,
    plan: 'free',
    totalGenerations: 10,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userProfile: mockUserProfile,
    onUpgrade: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when not open', () => {
    const { container } = render(<Dashboard {...defaultProps} isOpen={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render when open', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display the credits count', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('tokens')).toBeInTheDocument();
  });

  it('should display the current plan', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('free')).toBeInTheDocument();
    expect(screen.getByText('Trial')).toBeInTheDocument();
  });

  it('should display total generations', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Thumbnails & Videos created')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Dashboard {...defaultProps} onClose={onClose} />);

    // Find the close button (X icon button)
    const closeButton = screen.getByRole('button', { name: '' });
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display all pricing plans', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Agency')).toBeInTheDocument();
  });

  it('should show "Current Plan" button for the active plan', () => {
    render(<Dashboard {...defaultProps} />);

    // There should be at least one "Current Plan" button (for the free plan)
    const currentPlanButtons = screen.getAllByRole('button', { name: 'Current Plan' });
    expect(currentPlanButtons.length).toBeGreaterThan(0);
  });

  it('should call onUpgrade when upgrade button is clicked', async () => {
    const onUpgrade = vi.fn();
    render(<Dashboard {...defaultProps} onUpgrade={onUpgrade} />);

    // Find and click the Creator upgrade button
    const upgradeButtons = screen.getAllByRole('button', { name: /Upgrade/i });
    await userEvent.click(upgradeButtons[0]);

    expect(onUpgrade).toHaveBeenCalledTimes(1);
    expect(onUpgrade).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        credits: expect.any(Number),
      })
    );
  });

  it('should show "Best Value" badge on Creator plan for non-creator users', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('Best Value')).toBeInTheDocument();
  });

  it('should not show "Best Value" badge when user is on Creator plan', () => {
    const creatorProfile: UserProfile = {
      credits: 500,
      plan: 'creator',
      totalGenerations: 50,
    };

    render(<Dashboard {...defaultProps} userProfile={creatorProfile} />);

    expect(screen.queryByText('Best Value')).not.toBeInTheDocument();
  });

  it('should display credit costs information', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText(/1 Thumbnail \(Standard\)/)).toBeInTheDocument();
    expect(screen.getByText(/1 Video/)).toBeInTheDocument();
  });

  it('should display plan features', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('1 Free Generation')).toBeInTheDocument();
    expect(screen.getByText('Commercial License')).toBeInTheDocument();
    expect(screen.getByText('Dedicated Support')).toBeInTheDocument();
  });
});
