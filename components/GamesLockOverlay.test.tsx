import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GamesLockOverlay } from './GamesLockOverlay';

describe('GamesLockOverlay', () => {
  it('shows progress and provides an accessible way to open the games area', () => {
    const onClick = vi.fn();
    render(
      <GamesLockOverlay
        requiredCorrect={7}
        totalQuestions={10}
        passesCount={2}
        requiredPasses={3}
        onClick={onClick}
      />
    );
    const button = screen.getByRole('button', { name: /2 of 3 passing quizzes/i });
    expect(button).toBeVisible();
    expect(screen.getByText(/One more to go/i)).toBeVisible();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
