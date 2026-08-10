import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('progressVisualizationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('restores saved skill progress instead of replacing it with defaults', async () => {
    localStorage.setItem('ks2_skill_trees', JSON.stringify({
      Maths: {
        subject: 'Maths',
        nodes: [],
        totalNodes: 5,
        completedNodes: 3,
        unlockedNodes: 4,
      },
    }));

    const { progressVisualizationService } = await import('./progressVisualizationService');

    expect(progressVisualizationService.getSkillTree('Maths')).toMatchObject({
      completedNodes: 3,
      unlockedNodes: 4,
    });
  });
});
