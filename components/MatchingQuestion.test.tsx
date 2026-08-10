import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchingQuestion } from './MatchingQuestion';

describe('MatchingQuestion', () => {
  it('creates and removes a match without nesting interactive buttons', () => {
    const { container } = render(
      <MatchingQuestion
        pairs={[
          { left: 'cat', right: 'gato' },
          { left: 'dog', right: 'perro' },
        ]}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'cat' }));
    fireEvent.click(screen.getByRole('button', { name: 'gato' }));

    expect(screen.getByText('→ gato')).toBeInTheDocument();
    expect(container.querySelector('button button')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Remove match for cat' }));
    expect(screen.queryByText('→ gato')).not.toBeInTheDocument();
  });
});
