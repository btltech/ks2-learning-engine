import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProgressView from './ProgressView';

vi.mock('../components/ProgressChart', () => ({ default: () => <div>Progress chart</div> }));
vi.mock('../components/CertificateGallery', () => ({ default: () => <div>Certificate gallery</div> }));
vi.mock('../components/SkillTreeView', () => ({ default: () => <div>Skill tree</div> }));
vi.mock('../services/progressVisualizationService', () => ({
  progressVisualizationService: {
    getSkillTree: (subject: string) => ({ subject, totalNodes: 2, completedNodes: 1, unlockedNodes: 1, nodes: [] }),
  },
}));
vi.mock('../services/socialLearningService', () => ({
  socialLearningService: { getFriends: () => [] },
}));

describe('ProgressView', () => {
  it('opens the friends deep link and keeps every tab usable', () => {
    render(
      <MemoryRouter initialEntries={['/progress?tab=friends']}>
        <ProgressView />
      </MemoryRouter>,
    );

    expect(screen.getByRole('tabpanel')).toHaveTextContent('No learning friends linked yet');
    fireEvent.click(screen.getByRole('tab', { name: /certificates/i }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Certificate gallery');
  });
});
