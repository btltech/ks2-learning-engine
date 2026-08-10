import { describe, expect, it } from 'vitest';
import { parseParentWorkspaceTab, parseTeacherDashboardView } from './dashboardRoutes';

describe('dashboard route tabs', () => {
  it('opens supported parent and teacher deep links', () => {
    expect(parseParentWorkspaceTab('insights')).toBe('insights');
    expect(parseParentWorkspaceTab('reports')).toBe('reports');
    expect(parseTeacherDashboardView('assignments')).toBe('assignments');
    expect(parseTeacherDashboardView('reports')).toBe('reports');
  });

  it('falls back safely when a tab is invalid', () => {
    expect(parseParentWorkspaceTab('billing')).toBe('overview');
    expect(parseTeacherDashboardView(null)).toBe('overview');
  });
});
