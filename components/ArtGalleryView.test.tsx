import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArtGalleryView from './ArtGalleryView';

describe('art gallery navigation survives its presentation changes',()=>{
  it('keeps age-filtered lessons and the existing lesson/back callbacks',()=>{
    const onSelectLesson=vi.fn(),onBack=vi.fn();
    render(<ArtGalleryView studentAge={9} onBack={onBack} onSelectArtwork={vi.fn()} onSelectLesson={onSelectLesson}/>);
    fireEvent.click(screen.getByRole('button',{name:/Drawing Lessons/}));
    expect(screen.getByRole('button',{name:/Drawing Lessons/})).toHaveAttribute('aria-pressed','true');
    expect(screen.queryByRole('button',{name:/Drawing with Basic Shapes/})).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:/Draw Your Self-Portrait/}));
    expect(onSelectLesson).toHaveBeenCalledWith(expect.objectContaining({id:'self-portrait'}));
    fireEvent.click(screen.getByRole('button',{name:/Back/}));
    expect(onBack).toHaveBeenCalledOnce();
  });
  it('retains artwork details before calling the quiz route callback',()=>{
    const onSelectArtwork=vi.fn();
    render(<ArtGalleryView studentAge={9} onBack={vi.fn()} onSelectArtwork={onSelectArtwork} onSelectLesson={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:/The Starry Night/}));
    expect(screen.getByRole('dialog',{name:/The Starry Night/})).toBeVisible();
    expect(onSelectArtwork).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:/Take Quiz/}));
    expect(onSelectArtwork).toHaveBeenCalledWith(expect.objectContaining({id:'starry-night'}));
  });
});
