import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SkillNode } from '../../services/progressVisualizationService';
import { SubjectSegments, StickerBook, skillSegments } from './ProgressPresentation';

describe('progress presentation uses existing achievement state', () => {
  it('counts completed, attempted and unattempted milestones without treating unlocked as learned', () => {
    const nodes = [{isCompleted:true,progress:80},{isCompleted:false,progress:40},{isCompleted:false,progress:0,isUnlocked:true},{isCompleted:false,progress:0,isUnlocked:false}] as SkillNode[];
    expect(skillSegments(nodes)).toEqual({confident:1,learning:1,notStarted:2});
    render(<SubjectSegments nodes={nodes} label="Maths" />);
    expect(screen.getByText('Maths: one confident · one learning · two not started')).toBeVisible();
  });
  it('marks a badge earned only when it is in the supplied award list', () => {
    const view=render(<StickerBook badges={[{id:'first-steps',name:'First Steps',description:'Complete your first quiz',icon:'🏁'}]} />);
    expect(view.container.querySelectorAll('[data-earned="true"]')).toHaveLength(1);
    expect(screen.getByText('✓ Earned')).toBeVisible();
    expect(screen.getByText('Locked · Earn 100 points')).toBeVisible();
  });
});
