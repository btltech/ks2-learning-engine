import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Difficulty } from '../types';
import MicrolearningCard from './MicrolearningCard';

describe('MicrolearningCard', () => {
  it('hands navigation to its owning dashboard once', () => {
    const onStart = vi.fn();
    const session = {
      id: 'quick-maths',
      title: 'Quick Maths',
      description: 'Five focused questions',
      duration: 300,
      questionCount: 5,
      subject: 'Maths',
      topic: 'Number - addition and subtraction',
      difficulty: Difficulty.Medium,
      estimatedPoints: 50,
    };

    render(<MicrolearningCard session={session} onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }));

    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledWith(session);
  });
});
