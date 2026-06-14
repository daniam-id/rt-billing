'use client';

import { useMemo, useState } from 'react';
import { BillRecord } from '@/hooks/useBilling';
import { useMarkPaid } from '@/hooks/useMutations';
import { Badge, Button, EmptyState, Input, Select, Td, Th } from './ui';
import { MeterEditor } from './MeterEditor';

interface Props {
  records: BillRecord[];
  loading?: boolean;
}

function formatIDR(n: string | number): string {
  const v = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

function StatusBadge({ stat }: { stat: BillRecord['paymentStat'] }) {
  if (stat === 'Paid') return <Badge variant="paid">Paid</Badge>;
  if (stat === 'Overdue') return <Badge variant="overdue">Overdue</Badge>;
  return <Badge variant="pending">Pending</Badge>;
}

export function TransactionTable({ records, loading }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const markPaid = useMarkPaid();

  const billTypes = useMemo(() => {
    const set = new Map<string, string>();
    records.forEach((r) => set.set(r.billType.id, r.billType.name));
    return Array.from(set.entries());
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'all' && r.paymentStat !== statusFilter) return false;
      if (typeFilter !== 'all' && r.billType.id !== typeFilter) return false;
      if (search && !`${r.household.houseNumber} ${r.household.headOfFamily}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [records, statusFilter, typeFilter, search]);

  if (loading) {
    return <div className="bg-canvas border border-border rounded-md p-12 text-center text-sm text-text-muted">Loading transactions…</div>;
  }

  if (records.length === 0) {
    return (
      <div className="bg-canvas border border-border rounded-md">
        <EmptyState
          title="No transactions for this period"
          hint="Initialize a billing period to generate bill records."
        />
      </div>
    );
  }

  return (
    <div className="bg-canvas border border-border rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-surface">
        <Input placeholder="Search house or family…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="max-w-[160px]">
          <option value="all">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="max-w-[200px]">
          <option value="all">All bill types</option>
          {billTypes.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Select>
        <p className="ml-auto text-xs text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{filtered.length}</span> of {records.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <Th>House No.</Th>
              <Th>Head of Family</Th>
              <Th>Bill Type</Th>
              <Th>Meter</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-surface">
                <Td className="font-mono">{r.household.houseNumber}</Td>
                <Td>{r.household.headOfFamily}</Td>
                <Td>{r.billType.name}</Td>
                <Td><MeterEditor record={r} /></Td>
                <Td className="text-right font-mono">{formatIDR(r.totalAmount)}</Td>
                <Td><StatusBadge stat={r.paymentStat} /></Td>
                <Td className="text-right">
                  {r.paymentStat === 'Paid' ? (
                    <span className="text-xs text-text-muted">—</span>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={markPaid.isPending}
                      onClick={() => markPaid.mutate(r.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
