import { beforeEach, describe, expect, it, vi } from 'vitest';

const getIdToken = vi.fn(async () => 'firebase-token');

vi.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { getIdToken } }),
}));

import { homeworkStats, teacherWorkspaceService } from './teacherWorkspaceService';
import { Difficulty } from '../types';

describe('teacherWorkspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads shared classes with a Firebase bearer token', async () => {
    const classes = [{ classId: 'class-1', className: 'Maple' }];
    vi.stubGlobal('fetch', vi.fn(async (_path, init) => {
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer firebase-token');
      return new Response(JSON.stringify({ classes }), { status: 200 });
    }));

    await expect(teacherWorkspaceService.getClasses()).resolves.toEqual(classes);
  });

  it('creates shared homework for the selected class', async () => {
    const fetchMock = vi.fn(async (_path, init) => {
      const body = JSON.parse(String(init?.body));
      expect(body).toMatchObject({ action: 'create', assignedClassIds: ['class-1'] });
      return new Response(JSON.stringify({ homework: { homeworkId: 'hw-1', ...body, submissions: [] } }), { status: 201 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const homework = await teacherWorkspaceService.createHomework({
      title: 'Fractions',
      description: '',
      subject: 'Maths',
      topic: 'Fractions',
      difficulty: Difficulty.Medium,
      questionCount: 10,
      dueDate: '2026-08-10T23:59:00.000Z',
      assignedClassIds: ['class-1'],
    });
    expect(homework.homeworkId).toBe('hw-1');
  });

  it('surfaces backend errors instead of silently falling back to local storage', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })));
    await expect(teacherWorkspaceService.joinClass('ABC234')).rejects.toThrow('Forbidden');
  });

  it('calculates assignment completion without negative pending counts', () => {
    const stats = homeworkStats({ submissions: [{ score: 80 }, { score: 100 }] } as any, 1);
    expect(stats).toEqual({ totalAssigned: 1, submitted: 2, pending: 0, averageScore: 90 });
  });
});
