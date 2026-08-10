export type ParentWorkspaceTab = 'overview' | 'progress' | 'insights' | 'reports' | 'leaderboard' | 'settings';
export type TeacherDashboardView = 'overview' | 'students' | 'assignments' | 'reports';

export const parseParentWorkspaceTab = (value: string | null): ParentWorkspaceTab => {
  const tabs: ParentWorkspaceTab[] = ['overview', 'progress', 'insights', 'reports', 'leaderboard', 'settings'];
  return tabs.includes(value as ParentWorkspaceTab) ? value as ParentWorkspaceTab : 'overview';
};

export const parseTeacherDashboardView = (value: string | null): TeacherDashboardView => {
  const views: TeacherDashboardView[] = ['overview', 'students', 'assignments', 'reports'];
  return views.includes(value as TeacherDashboardView) ? value as TeacherDashboardView : 'overview';
};
