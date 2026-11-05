import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import DrawingLessonView from './DrawingLessonView';
import type { DrawingLesson } from '../data/artResources';

it('retains step selection, completion gating and the finish callback',()=>{
  const lesson:DrawingLesson={id:'review',title:'Draw an idea',difficulty:'Easy',ageGroup:[7],duration:'10 minutes',materials:['Pencil'],relatedArtworks:[],tips:[],steps:[{stepNumber:1,instruction:'Draw a circle'},{stepNumber:2,instruction:'Add a face'}]};
  const onComplete=vi.fn();
  render(<DrawingLessonView lesson={lesson} studentAge={7} onBack={vi.fn()} onComplete={onComplete}/>);
  fireEvent.click(screen.getByRole('button',{name:'2'}));
  expect(screen.getByRole('button',{name:'2'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('button',{name:/Finish/})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:/Mark Complete/}));
  expect(screen.getByRole('button',{name:/Finish/})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:/Previous/}));
  fireEvent.click(screen.getByRole('button',{name:/Mark Complete/}));
  fireEvent.click(screen.getByRole('button',{name:/Finish/}));
  expect(onComplete).toHaveBeenCalledOnce();
});
