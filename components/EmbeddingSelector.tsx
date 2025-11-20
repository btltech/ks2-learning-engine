import React, { useEffect, useState } from 'react';
import { getEmbeddingsCount, onEmbeddingsCount, setSpeakerIndex } from '../services/coquiTTS';

const EmbeddingSelector: React.FC = () => {
  const [count, setCount] = useState<number>(getEmbeddingsCount());
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    const unsub = onEmbeddingsCount((c) => {
      setCount(c);
      if (selected >= c) setSelected(0);
    });
    return () => unsub();
  }, [selected]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelected(idx);
    setSpeakerIndex(idx);
  };

  if (count <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="embedding-select" className="text-sm text-gray-600">Voice</label>
      <select id="embedding-select" value={selected} onChange={handleChange} className="px-3 py-2 rounded border">
        {Array.from({ length: count }).map((_, i) => (
          <option key={i} value={i}>Voice {i + 1}</option>
        ))}
      </select>
    </div>
  );
};

export default EmbeddingSelector;
