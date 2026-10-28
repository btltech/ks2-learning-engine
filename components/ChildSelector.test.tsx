import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ChildSelector from './ChildSelector';

const children = [{ id: 'example-1', name: 'Example child', age: 9 }, { id: 'example-2', name: 'Sample learner', age: 8 }];

describe('child picker behaviour', () => {
  it('preserves selection callbacks and the monitoring message', () => {
    const select = vi.fn();
    render(<ChildSelector children={children} selectedChildId="example-1" onSelectChild={select} />);
    expect(screen.getByText('✓ Currently Monitoring')).toBeTruthy();
    fireEvent.click(screen.getByText('Sample learner').closest('button')!);
    expect(select).toHaveBeenCalledWith('example-2');
  });

  it('keeps Add child permission-gated and preserves PIN mismatch announcements', () => {
    const create = vi.fn();
    const { rerender } = render(<ChildSelector children={children} selectedChildId={null} onSelectChild={vi.fn()} />);
    expect(screen.queryByRole('button', { name: '+ Add child and PIN' })).toBeNull();
    rerender(<ChildSelector children={children} selectedChildId={null} onSelectChild={vi.fn()} onCreateChild={create} />);
    fireEvent.click(screen.getByRole('button', { name: '+ Add child and PIN' }));
    fireEvent.change(screen.getByLabelText("Child's name"), { target: { value: 'Example learner' } });
    fireEvent.change(screen.getByLabelText('PIN (4–6 digits)'), { target: { value: '0000' } });
    fireEvent.change(screen.getByLabelText('Confirm PIN'), { target: { value: '1111' } });
    fireEvent.submit(screen.getByLabelText("Child's name").closest('form')!);
    expect(screen.getByRole('alert').textContent).toBe('PINs do not match.');
    expect(create).not.toHaveBeenCalled();
  });

  it('preserves profile creation and its existing status announcement', async () => {
    // Nonexistent test profile and placeholder PIN, never account credentials.
    const create = vi.fn().mockResolvedValue({ id: 'example-3', name: 'Example learner', age: 9 });
    render(<ChildSelector children={[]} selectedChildId={null} onSelectChild={vi.fn()} onCreateChild={create} />);
    fireEvent.change(screen.getByLabelText("Child's name"), { target: { value: 'Example learner' } });
    fireEvent.change(screen.getByLabelText('PIN (4–6 digits)'), { target: { value: '0000' } });
    fireEvent.change(screen.getByLabelText('Confirm PIN'), { target: { value: '0000' } });
    fireEvent.submit(screen.getByLabelText("Child's name").closest('form')!);
    expect(await screen.findByRole('status')).toBeTruthy();
    expect(screen.getByText("✓ Example learner's profile is ready")).toBeTruthy();
    expect(create).toHaveBeenCalledWith({ name: 'Example learner', age: 9, pin: '0000' });
  });
});
