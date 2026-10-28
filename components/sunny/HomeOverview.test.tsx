import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomeOverview } from './HomeOverview';
import { ChildNavigation } from './ChildNavigation';
import { SUBJECTS } from '../../constants';
import { Difficulty, type UserProfile } from '../../types';

vi.mock('../../hooks/useTTSEnhanced', () => ({
  useTTSEnhanced: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    isLoading: false,
    errorMessage: null,
  }),
}));
afterEach(cleanup);
const learner: UserProfile = {
  id: 'example',
  name: 'Example',
  role: 'student',
  age: 9,
  avatarConfig: { color: '#FFC93C' },
  totalPoints: 24,
  badges: [],
  unlockedItems: [],
  streak: 0,
  lastLoginDate: '',
  mastery: {},
  timeSpentLearning: {},
  preferredDifficulty: Difficulty.Medium,
  quizHistory: [
    {
      id: 'quiz',
      subject: 'Maths',
      topic: 'Fractions',
      score: 80,
      completedAt: '2026-10-26T12:00:00Z',
      timeSpent: 60,
      difficulty: Difficulty.Medium,
    },
  ],
};
function overview(profile = learner) {
  const select = vi.fn();
  const achievements = vi.fn();
  render(
    <MemoryRouter>
      <HomeOverview
        learner={profile}
        greeting="Hi, Example!"
        subjects={SUBJECTS}
        progress={{ Maths: ['Fractions'] }}
        onSelectSubject={select}
        onOpenAchievements={achievements}
        dailyChallenge={<button>Existing daily challenge</button>}
      >
        <button>Existing subject picker</button>
      </HomeOverview>
    </MemoryRouter>,
  );
  return { select, achievements };
}
describe('learner home overview', () => {
  it('uses the recorded quiz score and existing subject callback, without claiming lesson-part progress', () => {
    const { select, achievements } = overview();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
    expect(screen.getByText('Last quiz: 80%')).toBeInTheDocument();
    expect(screen.queryByText(/parts? done/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Carry on/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue Maths' }));
    expect(select.mock.calls.map(([subject]) => subject.name)).toEqual([
      'Maths',
      'Maths',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'View your badges' }));
    expect(achievements).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: 'Existing daily challenge' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Existing subject picker' }),
    ).toBeInTheDocument();
  });
  it('shows a truthful empty state for a new learner', () => {
    overview({ ...learner, quizHistory: [] });
    expect(
      screen.getByText(
        'Your recent subjects will appear here after your first quiz.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Start learning/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Carry on/ }),
    ).not.toBeInTheDocument();
  });
  it.each([
    ['/', 'Home'],
    ['/#subjects', 'Learn'],
    ['/subject/Languages/French', 'Learn'],
    ['/progress', 'My progress'],
    ['/games', 'Games'],
  ])(
    'marks the correct existing navigation destination at %s',
    (path, label) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <ChildNavigation playClick={vi.fn()} />
        </MemoryRouter>,
      );
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(
        screen
          .getAllByRole('link')
          .filter((link) => link.hasAttribute('aria-current')),
      ).toHaveLength(1);
      expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute(
        'href',
        '/games',
      );
      expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute(
        'href',
        '/#subjects',
      );
    },
  );
});
