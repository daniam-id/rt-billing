'use client';

import { DashboardKPI } from '@/hooks/useBilling';

function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
}

function KpiCard({ label, value, hint, tone = 'default' }: KpiCardProps) {
  const valueClass =
    tone === 'positive' ? 'text-emerald-700' : tone === 'negative' ? 'text-red-700' : 'text-text-primary';
  return (
    <div className="bg-canvas border border-border rounded-md p-4">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-2 ${valueClass}`}>{value}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function KPIGrid({ kpi }: { kpi: DashboardKPI | undefined }) {
  if (!kpi) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-canvas border border-border rounded-md p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Total Billed" value={formatIDR(kpi.totalBilled)} hint={`${kpi.totalCount} records`} />
      <KpiCard label="Collected" value={formatIDR(kpi.totalCollected)} tone="positive" hint={`${kpi.paidCount} paid`} />
      <KpiCard label="Arrears" value={formatIDR(kpi.totalArrears)} tone="negative" hint={`${kpi.pendingCount} pending`} />
      <KpiCard label="Collection Rate" value={formatPct(kpi.collectionRate)} hint={`Period ${kpi.period}`} />
    </div>
  );
}
