import { describe, expect, it } from 'vitest';
import { getCanvasPoint } from './DrawingCanvas';

describe('getCanvasPoint', () => {
  it('maps pointer coordinates into the backing canvas when it is responsively scaled', () => {
    expect(getCanvasPoint(
      160,
      120,
      { left: 10, top: 20, width: 300, height: 200 },
      600,
      400,
    )).toEqual({ x: 300, y: 200 });
  });

  it('does not create infinite coordinates for a hidden canvas', () => {
    expect(getCanvasPoint(
      10,
      20,
      { left: 0, top: 0, width: 0, height: 0 },
      600,
      400,
    )).toEqual({ x: 10, y: 20 });
  });
});
