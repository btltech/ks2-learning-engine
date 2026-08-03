import React, { useEffect, useState } from 'react';

interface OrderingQuestionProps {
  items: string[];
  onChange: (orderedItems: string[]) => void;
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ items, onChange }) => {
  const [orderedItems, setOrderedItems] = useState<string[]>(items);

  useEffect(() => {
    const next = [...items];
    setOrderedItems(next);
    onChange(next);
  }, [items, onChange]);

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= orderedItems.length) return;
    const next = [...orderedItems];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderedItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-3" aria-label="Put the items in the correct order">
      <p className="text-sm font-medium text-gray-600">Use the arrow buttons to put these items in order.</p>
      <ol className="space-y-2">
        {orderedItems.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl border-2 border-indigo-100 bg-indigo-50 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">{index + 1}</span>
            <span className="flex-1 font-semibold text-gray-800">{item}</span>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg border bg-white px-3 py-2 font-bold disabled:opacity-30" aria-label={`Move ${item} up`}>↑</button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === orderedItems.length - 1} className="rounded-lg border bg-white px-3 py-2 font-bold disabled:opacity-30" aria-label={`Move ${item} down`}>↓</button>
          </li>
        ))}
      </ol>
    </div>
  );
};
