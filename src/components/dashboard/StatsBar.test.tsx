import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import StatsBar from './StatsBar';

describe('StatsBar', () => {
  it('renders provided stats with their labels and counts', () => {
    render(
      <StatsBar
        stats={[
          { label: 'Resumes', count: 3, icon: 'resumes', trend: null },
          { label: 'Templates', count: 8, icon: 'templates', trend: null },
        ]}
      />
    );
    expect(screen.getByText('Resumes')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders default stats when no props are provided', () => {
    render(<StatsBar />);
    expect(screen.getByText('Resumes')).toBeInTheDocument();
    expect(screen.getByText('ATS Reports')).toBeInTheDocument();
  });
});
