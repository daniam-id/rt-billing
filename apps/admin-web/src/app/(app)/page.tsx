'use client';

import { useState } from 'react';
import { useDashboard, useBillingRecords } from '@/hooks/useBilling';
import { useInitializePeriod, useResetPeriod, getErrorMessage } from '@/hooks/useMutations';
import { KPIGrid } from '@/components/KPIGrid';
import { TransactionTable } from '@/components/TransactionTable';
import { PeriodSelector } from '@/components/PeriodSelector';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  const [period, setPeriod] = useState('');
  const dashboard = useDashboard(period);
  const records = useBillingRecords(period);
  const initialize = useInitializePeriod();
  const reset = useResetPeriod();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  function onInitialize() {
    if (!period) return;
    setActionError(null);
    setActionMsg(null);
    initialize.mutate(period, {
      onSuccess: (data) => setActionMsg(`Initialized ${data.created} record(s) for ${data.periodMonth}.`),
      onError: (e) => setActionError(getErrorMessage(e)),
    });
  }

  function onReset() {
    if (!period) return;
    if (!confirm(`Reset (delete all unpaid records for ${period})?`)) return;
    setActionError(null);
    setActionMsg(null);
    reset.mutate(period, {
      onSuccess: (data) => setActionMsg(`Deleted ${data.deleted} record(s) for ${data.periodMonth}.`),
      onError: (e) => setActionError(getErrorMessage(e)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-secondary">Realtime billing performance and transaction matrix</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button variant="secondary" onClick={onInitialize} disabled={initialize.isPending || !period}>
            {initialize.isPending ? 'Initializing…' : 'Initialize Period'}
          </Button>
          <Button variant="danger" onClick={onReset} disabled={reset.isPending || !period}>
            {reset.isPending ? 'Resetting…' : 'Reset Period'}
          </Button>
        </div>
      </div>

      {actionError && <div className="text-xs text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">{actionError}</div>}
      {actionMsg && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">{actionMsg}</div>}

      <KPIGrid kpi={dashboard.data} />

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-2">Transaction Matrix</h2>
        <TransactionTable records={records.data ?? []} loading={records.isLoading} />
      </section>
    </div>
  );
}
