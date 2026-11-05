import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DrawingCanvas } from './DrawingCanvas';

afterEach(() => vi.restoreAllMocks());
it('retains the original colours, brush range, clear and PNG submission after moving the tools', () => {
  const context = {lineCap:'',lineJoin:'',strokeStyle:'',lineWidth:0,fillStyle:'',fillRect:vi.fn()};
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype,'toDataURL').mockReturnValue('data:image/png;base64,review');
  const onSave=vi.fn();
  render(<DrawingCanvas onSave={onSave} idea="Draw a plant" />);
  expect(screen.getByText('Today’s idea: Draw a plant')).toBeVisible();
  expect(screen.getByRole('button',{name:'Select color #000000'})).toHaveAttribute('aria-pressed','true');
  fireEvent.click(screen.getByRole('button',{name:'Select color #00FF00'}));
  expect(context.strokeStyle).toBe('#00FF00');
  expect(screen.getByRole('button',{name:'Select color #00FF00'})).toHaveAttribute('aria-pressed','true');
  fireEvent.change(screen.getByLabelText('Brush size'),{target:{value:'12'}});
  expect(context.lineWidth).toBe(12);
  fireEvent.click(screen.getByRole('button',{name:'Clear'}));
  expect(context.fillRect).toHaveBeenLastCalledWith(0,0,600,400);
  fireEvent.click(screen.getByRole('button',{name:'Submit Drawing'}));
  expect(onSave).toHaveBeenCalledWith('data:image/png;base64,review');
});
