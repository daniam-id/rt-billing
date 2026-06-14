'use client';

import { useState } from 'react';
import { BillRecord } from '@/hooks/useBilling';
import { useUpdateMeter } from '@/hooks/useMutations';
import { Button } from './ui';

interface Props {
  record: BillRecord;
}

export function MeterEditor({ record }: Props) {
  const [initial, setInitial] = useState<string>(record.initialMeter?.toString() ?? '');
  const [final, setFinal] = useState<string>(record.finalMeter?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateMeter();

  if (record.billType.chargeType !== 'Variable') {
    return <span className="text-xs text-text-muted">—</span>;
  }

  function save() {
    setError(null);
    const i = Number(initial);
    const f = Number(final);
    if (!Number.isInteger(i) || !Number.isInteger(f) || i < 0 || f < 0) {
      setError('Meters must be non-negative integers');
      return;
    }
    if (f < i) {
      setError('Final must be ≥ initial');
      return;
    }
    update.mutate(
      { id: record.id, initialMeter: i, finalMeter: f },
      { onError: (e: unknown) => setError((e as Error).message) }
    );
  }

  const dirty =
    initial !== (record.initialMeter?.toString() ?? '') || final !== (record.finalMeter?.toString() ?? '');

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={initial}
          onChange={(e) => setInitial(e.target.value)}
          placeholder="Initial"
          className="w-20 px-2 py-1 text-xs border border-border rounded-md bg-canvas focus:outline-none focus:border-brand font-mono"
        />
        <span className="text-text-muted text-xs">→</span>
        <input
          type="number"
          min={0}
          value={final}
          onChange={(e) => setFinal(e.target.value)}
          placeholder="Final"
          className="w-20 px-2 py-1 text-xs border border-border rounded-md bg-canvas focus:outline-none focus:border-brand font-mono"
        />
        <Button
          variant="primary"
          className="text-xs px-2 py-1"
          disabled={!dirty || update.isPending}
          onClick={save}
        >
          {update.isPending ? '…' : 'Save'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
