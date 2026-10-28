import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TopicSelector from './TopicSelector';
import { SUBJECTS } from '../constants';
import { getCurriculumUnits } from '../data/curriculumSequences';
import { getTopicsForSubject } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({ getTopicsForSubject: vi.fn() }));
vi.mock('../hooks/useGameSounds', () => ({
  useGameSounds: () => ({ playClick: vi.fn() }),
}));
vi.mock('./OfflineBadge', () => ({ default: () => null }));
afterEach(cleanup);
const subject = SUBJECTS.find((item) => item.name === 'Maths')!;
const units = getCurriculumUnits('Maths', 9);
beforeEach(() => {
  vi.mocked(getTopicsForSubject)
    .mockReset()
    .mockResolvedValue(units.map((unit) => unit.title));
});
function setup() {
  const select = vi.fn();
  const back = vi.fn();
  render(
    <TopicSelector
      subject={subject}
      studentAge={9}
      progress={{ Maths: [units[0].title] }}
      onSelect={select}
      onBack={back}
    />,
  );
  return { select, back };
}
describe('subject topic path', () => {
  it('keeps published curriculum order, completion, recommendation and the existing lesson/back actions', async () => {
    const { select, back } = setup();
    const list = await screen.findByRole('list', { name: 'Available topics' });
    expect(list.tagName).toBe('OL');
    const choices = within(list).getAllByRole('button');
    expect(choices.map((button) => button.getAttribute('aria-label'))).toEqual(
      units.map(
        (unit, index) => unit.title + (index === 0 ? ' - completed' : ''),
      ),
    );
    expect(within(list).getByText('✓ Done')).toBeInTheDocument();
    expect(within(list).getByText('★ You are here')).toBeInTheDocument();
    fireEvent.click(choices[1]);
    expect(select).toHaveBeenCalledWith(units[1].title);
    fireEvent.click(
      screen.getByRole('button', { name: 'Go back to subject selection' }),
    );
    expect(back).toHaveBeenCalledOnce();
    expect(getTopicsForSubject).toHaveBeenCalledWith('Maths', 9);
  });
  it('filters locally without changing unit order or fetching a different year', async () => {
    setup();
    await screen.findByRole('list', { name: 'Available topics' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find a topic' }), {
      target: { value: units[2].title },
    });
    const list = screen.getByRole('list', { name: 'Available topics' });
    expect(within(list).getAllByRole('button')).toHaveLength(1);
    expect(
      within(list).getByText(`Unit ${units[2].order}`),
    ).toBeInTheDocument();
    expect(getTopicsForSubject).toHaveBeenCalledOnce();
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'no matching curriculum topic' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Show all topics' }));
    expect(
      within(
        screen.getByRole('list', { name: 'Available topics' }),
      ).getAllByRole('button'),
    ).toHaveLength(units.length);
  });
  it('retains the loading error and retry action', async () => {
    vi.mocked(getTopicsForSubject).mockRejectedValueOnce(new Error('offline'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    setup();
    expect(
      await screen.findByText(
        "Oops! We couldn't load the topics. Please check your internet connection and try again.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    await screen.findByRole('list', { name: 'Available topics' });
    expect(getTopicsForSubject).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });
});
