import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import StatsBar from './StatsBar';

describe('StatsBar', () => {
  it('renders given counts', () => {
    render(<StatsBar resumesCount={3} templatesCount={8} />);
    const resumes = screen.getByTestId('resumes-count');
    const templates = screen.getByTestId('templates-count');
    expect(resumes).toHaveTextContent('3');
    expect(templates).toHaveTextContent('8');
  });

  it('defaults to zero when no props are provided', () => {
    render(<StatsBar />);
    expect(screen.getByTestId('resumes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('templates-count')).toHaveTextContent('0');
  });
});
