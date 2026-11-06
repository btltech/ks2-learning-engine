import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ParentMonitoringDashboard from './ParentMonitoringDashboard';
import ParentDashboard from './ParentDashboard';
import SubjectProgressCharts from './SubjectProgressCharts';
import StruggleAlert from './StruggleAlert';

const review = vi.hoisted(() => {
  const child = { id: 'synthetic-child', name: 'Example learner', age: 9, role: 'student', totalPoints: 120, streak: 2, badges: [], quizHistory: [], mastery: { Maths: { Addition: 90, Fractions: 50 }, English: { Reading: 80 } } };
  return { child, selectChild: vi.fn(), refresh: vi.fn().mockResolvedValue(undefined), reset: vi.fn().mockResolvedValue(undefined), deleteChild: vi.fn().mockResolvedValue(undefined), generate: vi.fn().mockResolvedValue('Synthetic progress report'), insights: vi.fn().mockResolvedValue('Synthetic learning insights') };
});
vi.mock('../context/UserContext', () => ({ useUser: () => ({ user: { id: 'synthetic-parent', name: 'Example parent', role: 'parent', parentCode: 'DEMO-ONLY' }, currentChild: review.child, linkedChildren: [review.child], selectedChildId: review.child.id, selectChild: review.selectChild, refreshLinkedChildren: review.refresh, setUser: vi.fn() }) }));
vi.mock('../hooks/useRealtimeListeners', () => ({ useRealtimeStudentActivity: () => ({}), useRealtimeChildProfile: () => ({ childData: review.child }), useRealtimeLeaderboard: () => ({ leaderboard: [], loading: false, error: null }) }));
vi.mock('../services/firebaseAuthService', () => ({ firebaseAuthService: { resetChildProfile: review.reset, deleteChild: review.deleteChild } }));
vi.mock('../services/geminiService', () => ({ generateProgressReport: review.generate, generateLearningInsights: review.insights }));
vi.mock('../services/authService', () => ({ authService: { getParentStats: () => ({ totalTimeSpent: 90, quizzesTaken: 3, averageScore: 75, strongestSubject: 'English', weakestSubject: 'Maths', recentActivity: [] }) } }));
const monitoring = (tab = 'overview') => render(<MemoryRouter initialEntries={['/parent-monitoring?tab=' + tab]}><ParentMonitoringDashboard onLogout={vi.fn()} /></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); vi.spyOn(window, 'alert').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('Clear Path parent presentation preserves existing actions and data', () => {
  it('keeps every tab reachable by keyboard through the existing route action', () => {
    monitoring();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Overview' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Progress' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Learning Progress' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Progress' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: '⚙️ Settings' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Reset Everything' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('tab', { name: '⚙️ Settings' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(review.reset).not.toHaveBeenCalled();
  });

  it('keeps full reset behind its original confirmation and cancellation', async () => {
    monitoring('settings');
    fireEvent.click(screen.getByRole('button', { name: 'Reset Everything' }));
    const dialog = screen.getByRole('alertdialog', { name: '⚠️ Confirm Reset' });
    expect(dialog).toHaveTextContent('This action cannot be undone!');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(review.reset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reset Everything' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Reset All' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(review.reset).toHaveBeenCalledExactlyOnceWith('synthetic-child');
    expect(review.refresh).toHaveBeenCalledOnce();
  });

  it('preserves the child deletion confirmation and selected-child payload', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    monitoring();
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
    expect(confirm).toHaveBeenCalledWith("Delete Example learner's profile? This cannot be undone.");
    expect(review.deleteChild).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete', exact: true })).toBeEnabled());
    expect(review.deleteChild).toHaveBeenCalledExactlyOnceWith('synthetic-child');
    expect(review.refresh).toHaveBeenCalledOnce();
  });

  it('preserves report generation, disclosure and the existing data arguments', async () => {
    monitoring('reports');
    expect(screen.getByText(/Reports send limited age, quiz and mastery summaries/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '📊 Generate Progress Report' }));
    expect(await screen.findByText('Synthetic progress report')).toBeInTheDocument();
    expect(review.generate).toHaveBeenCalledExactlyOnceWith(review.child, 9, 'Example learner');
  });

  it('keeps the legacy dashboard dialog and report controls working', async () => {
    const close = vi.fn();
    render(<ParentDashboard onClose={close} />);
    expect(screen.getByRole('dialog', { name: '👨‍👩‍👧 Parent Dashboard' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));
    expect(await screen.findByText('Synthetic progress report')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });

  it('provides a table alternative using exactly the chart’s existing numbers', () => {
    render(<SubjectProgressCharts subjects={['Maths', 'English']} childMastery={review.child.mastery} />);
    const table = screen.getByRole('table', { name: 'Subject progress data' });
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('English80%11');
    expect(rows[2]).toHaveTextContent('Maths70%12');
    expect(screen.getByLabelText('Subject progress data')).toHaveAttribute('tabindex', '0');
  });

  it('preserves the struggle alert accept delay and callbacks', () => {
    vi.useFakeTimers();
    const accept = vi.fn(), dismiss = vi.fn();
    render(<StruggleAlert intervention={{ type: 'parent_alert', message: 'Synthetic support message' }} onAccept={accept} onDismiss={dismiss} />);
    expect(screen.getByRole('dialog', { name: "Let's Get Some Help" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Notify Parent' }));
    act(() => vi.advanceTimersByTime(299));
    expect(accept).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(accept).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
