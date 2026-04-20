'use client';
import { useState } from 'react';

export function TagInput({
  value, onChange, placeholder, suggestions = [], max = 10,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
  max?: number;
}) {
  const [input, setInput] = useState('');

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setInput('');
  }
  function remove(tag: string) { onChange(value.filter((v) => v !== tag)); }

  const filtered = input
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 6)
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-saffron/20 text-navy rounded-full text-xs">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-navy/60 hover:text-navy">×</button>
          </span>
        ))}
      </div>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
        }}
        placeholder={placeholder ?? 'Type and press Enter'}
        disabled={value.length >= max}
      />
      {filtered.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded-full hover:bg-beige"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">{value.length}/{max}</p>
    </div>
  );
}
