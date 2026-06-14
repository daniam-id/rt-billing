'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface DashboardKPI {
  period: string;
  totalBilled: number;
  totalCollected: number;
  totalArrears: number;
  collectionRate: number;
  paidCount: number;
  pendingCount: number;
  totalCount: number;
}

export interface BillRecord {
  id: string;
  householdId: string;
  billTypeId: string;
  periodMonth: string;
  totalAmount: string; // Prisma Decimal serialised
  initialMeter: number | null;
  finalMeter: number | null;
  paymentStat: 'Paid' | 'Pending' | 'Overdue';
  paidAt: string | null;
  household: { id: string; houseNumber: string; headOfFamily: string; status: string };
  billType: { id: string; name: string; chargeType: 'Flat' | 'Variable'; ratePerUnit: string; unit: string | null };
}

interface ListRecordsResponse {
  ok: true;
  data: BillRecord[];
}

export function useDashboard(period: string) {
  return useQuery<DashboardKPI>({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await api.get<{ ok: true; data: DashboardKPI }>('/api/v1/dashboard', {
        params: { period },
      });
      return res.data.data;
    },
    enabled: Boolean(period),
  });
}

export function useBillingRecords(period?: string) {
  return useQuery<BillRecord[]>({
    queryKey: ['billing', 'records', period ?? 'all'],
    queryFn: async () => {
      const res = await api.get<ListRecordsResponse>('/api/v1/billing/records', {
        params: period ? { period } : undefined,
      });
      return res.data.data;
    },
  });
}

export function usePeriods() {
  return useQuery<string[]>({
    queryKey: ['billing', 'periods'],
    queryFn: async () => {
      const res = await api.get<{ ok: true; data: string[] }>('/api/v1/dashboard/periods');
      return res.data.data;
    },
  });
}
