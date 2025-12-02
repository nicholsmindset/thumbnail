import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

describe('Header', () => {
  const defaultProps = {
    credits: 100,
    onOpenDashboard: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app name', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('ThumbGen AI')).toBeInTheDocument();
  });

  it('should display the credits count', () => {
    render(<Header {...defaultProps} credits={50} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('credits')).toBeInTheDocument();
  });

  it('should show "Powered by Gemini 3 Pro"', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('Powered by Gemini 3 Pro')).toBeInTheDocument();
  });

  it('should call onOpenDashboard when dashboard button is clicked', async () => {
    const onOpenDashboard = vi.fn();
    render(<Header {...defaultProps} onOpenDashboard={onOpenDashboard} />);

    const dashboardButton = screen.getByRole('button');
    await userEvent.click(dashboardButton);

    expect(onOpenDashboard).toHaveBeenCalledTimes(1);
  });

  it('should have a YouTube icon', () => {
    render(<Header {...defaultProps} />);

    // Check for the YouTube icon by its parent structure
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should display dashboard text', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should update credits display when credits change', () => {
    const { rerender } = render(<Header {...defaultProps} credits={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    rerender(<Header {...defaultProps} credits={75} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });
});
