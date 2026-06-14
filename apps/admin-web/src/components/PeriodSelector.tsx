'use client';

import { useEffect, useState } from 'react';
import { usePeriods } from '@/hooks/useBilling';
import { Select } from './ui';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function PeriodSelector({ value, onChange }: Props) {
  const { data: periods = [] } = usePeriods();
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!value) onChange(currentPeriod());
  }, [value, onChange]);

  const all = Array.from(new Set([currentPeriod(), ...periods])).sort().reverse();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-text-secondary">Period</span>
      {!manual ? (
        <Select value={value} onChange={(e) => onChange(e.target.value)} className="w-40">
          {all.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      ) : (
        <input
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-canvas focus:outline-none focus:border-brand"
        />
      )}
      <button
        type="button"
        onClick={() => setManual((m) => !m)}
        className="text-xs text-text-secondary hover:text-text-primary"
      >
        {manual ? 'Pick from list' : 'Custom…'}
      </button>
    </div>
  );
}
