import { useLayoutEffect, useRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderingQuestion } from './OrderingQuestion';

afterEach(cleanup);
const order = () => screen.getAllByRole('listitem').map(item => item.children[1].textContent);

describe('OrderingQuestion preserves the child’s order', () => {
  it('keeps a reorder made before passive mount effects flush', () => {
    const onChange = vi.fn();
    function EarlyInteraction() {
      const container = useRef<HTMLDivElement>(null);
      // Simulate input in the commit-to-passive-effect window deterministically.
      useLayoutEffect(() => {
        container.current?.querySelector<HTMLButtonElement>('[aria-label="Move Two down"]')?.click();
      }, []);
      return <div ref={container}><OrderingQuestion items={['Two', 'One']} onChange={onChange} /></div>;
    }
    render(<EarlyInteraction />);
    expect(order()).toEqual(['One', 'Two']);
    expect(onChange.mock.calls.every(([answer]) => JSON.stringify(answer) === '["One","Two"]')).toBe(true);
  });

  it('preserves a reorder when items and callback get new identities, but resets for changed contents', () => {
    const { rerender } = render(<OrderingQuestion items={['Two', 'One']} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Two down' }));
    const onChange = vi.fn();
    rerender(<OrderingQuestion items={['Two', 'One']} onChange={onChange} />);
    expect(order()).toEqual(['One', 'Two']);
    expect(onChange).toHaveBeenLastCalledWith(['One', 'Two']);
    rerender(<OrderingQuestion items={['Three', 'Four']} onChange={onChange} />);
    expect(order()).toEqual(['Three', 'Four']);
    expect(onChange).toHaveBeenLastCalledWith(['Three', 'Four']);
  });
});
