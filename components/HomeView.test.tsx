import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomeView from './HomeView';

vi.mock('../context/UserContext', () => ({ useUser: () => ({ user: null, currentChild: null }) }));
vi.mock('../services/teacherWorkspaceService', () => ({ teacherWorkspaceService: {} }));
vi.mock('./SubjectSelector', () => ({ default: () => <div>Subject picker</div> }));
vi.mock('./DailyChallenge', () => ({ DailyChallengeCard: () => null, StreakMilestone: () => null }));
vi.mock('./ReviewMode', () => ({ ReviewDueBadge: () => null }));
vi.mock('./SkillProgressWidget', () => ({ default: () => <div>Skill progress</div> }));
vi.mock('./NextCertificateWidget', () => ({ default: () => <div>Next certificate</div> }));
afterEach(cleanup);

function setup() {
  render(<MemoryRouter><HomeView progress={{}} onSelectSubject={vi.fn()} onStartDailyChallenge={vi.fn()} onOpenReviewMode={vi.fn()} onOpenAchievements={vi.fn()} /></MemoryRouter>);
  return screen.getAllByRole('tab');
}
function expectSelected(tab: HTMLElement) {
  expect(tab).toHaveFocus();
  for (const other of screen.getAllByRole('tab')) {
    expect(other).toHaveAttribute('aria-selected', String(other === tab));
    expect(other).toHaveAttribute('tabindex', other === tab ? '0' : '-1');
    const panel = document.getElementById(other.getAttribute('aria-controls')!)!;
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', other.id);
    expect(panel.hidden).toBe(other !== tab);
  }
}
describe('home tabs keyboard pattern', () => {
  it('starts with Learn selected and gives every tab its own labelled panel', () => {
    const tabs = setup();
    expect(tabs.map(tab => tab.getAttribute('aria-controls'))).toEqual(['home-tabpanel-learn', 'home-tabpanel-play', 'home-tabpanel-progress']);
    act(() => tabs[0].focus());
    expectSelected(tabs[0]);
  });
  it('moves right with automatic selection and wraps from Progress to Learn', () => {
    const tabs = setup(); act(() => tabs[0].focus());
    for (const next of [1, 2, 0]) {
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      expectSelected(tabs[next]);
    }
  });
  it('moves left with automatic selection and wraps from Learn to Progress', () => {
    const tabs = setup(); act(() => tabs[0].focus());
    for (const next of [2, 1, 0]) {
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      expectSelected(tabs[next]);
    }
  });
  it('uses End and Home to select the last and first tabs', () => {
    const tabs = setup(); act(() => tabs[1].focus());
    fireEvent.keyDown(tabs[1], { key: 'End' }); expectSelected(tabs[2]);
    fireEvent.keyDown(tabs[2], { key: 'Home' }); expectSelected(tabs[0]);
  });
  it('selects a directly focused tab and retains mouse selection', () => {
    const tabs = setup(); act(() => tabs[1].focus()); expectSelected(tabs[1]);
    fireEvent.click(tabs[0]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
  });
  it('prevents scrolling for navigation keys but leaves other keys and browser shortcuts alone', () => {
    const tabs = setup(); act(() => tabs[0].focus());
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    act(() => tabs[0].dispatchEvent(arrow)); expect(arrow.defaultPrevented).toBe(true);
    for (const options of [{ key: 'ArrowUp' }, { key: 'Escape' }, { key: 'ArrowLeft', altKey: true }, { key: 'Home', ctrlKey: true }, { key: 'End', metaKey: true }]) {
      const event = new KeyboardEvent('keydown', { ...options, bubbles: true, cancelable: true });
      act(() => tabs[1].dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false); expectSelected(tabs[1]);
    }
  });
});
