'use client';

import { useMemo, useState } from 'react';
import { useBillingRecords } from '@/hooks/useBilling';
import { Badge, EmptyState, Input, Select, Td, Th } from '@/components/ui';
import { PeriodSelector } from '@/components/PeriodSelector';

function formatIDR(n: string | number): string {
  const v = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function LedgerPage() {
  const [period, setPeriod] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');
  const [search, setSearch] = useState('');
  const records = useBillingRecords(period || undefined);

  const rows = useMemo(() => {
    return (records.data ?? []).filter((r) => {
      if (statusFilter !== 'all' && r.paymentStat !== statusFilter) return false;
      if (search && !`${r.household.houseNumber} ${r.household.headOfFamily}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [records.data, statusFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Transaction Ledger</h1>
          <p className="text-xs text-text-secondary">Historical billing transactions across all periods</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="bg-canvas border border-border rounded-md">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-surface">
          <Input placeholder="Search house or family…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="max-w-[160px]">
            <option value="all">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </Select>
          <p className="ml-auto text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{rows.length}</span> record(s)
          </p>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="No transactions found" hint="Try a different period or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <Th>Period</Th>
                  <Th>House</Th>
                  <Th>Family</Th>
                  <Th>Bill Type</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Paid At</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface">
                    <Td className="font-mono">{r.periodMonth}</Td>
                    <Td className="font-mono">{r.household.houseNumber}</Td>
                    <Td>{r.household.headOfFamily}</Td>
                    <Td>{r.billType.name}</Td>
                    <Td className="text-right font-mono">{formatIDR(r.totalAmount)}</Td>
                    <Td>
                      {r.paymentStat === 'Paid' ? <Badge variant="paid">Paid</Badge> : r.paymentStat === 'Overdue' ? <Badge variant="overdue">Overdue</Badge> : <Badge variant="pending">Pending</Badge>}
                    </Td>
                    <Td className="text-xs text-text-secondary">{r.paidAt ? new Date(r.paidAt).toLocaleDateString('id-ID') : '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
