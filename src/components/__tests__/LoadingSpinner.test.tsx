import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12');
  });

  it('renders in full screen mode', () => {
    render(<LoadingSpinner fullScreen />);
    const container = screen.getByRole('status').closest('.fixed.inset-0');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('z-50');
  });

  it('renders in overlay mode', () => {
    render(<LoadingSpinner overlay />);
    const container = screen.getByRole('status').closest('.absolute.inset-0');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('z-10');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
