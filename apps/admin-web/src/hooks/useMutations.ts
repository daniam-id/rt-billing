'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/axios';

export function useInitializePeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (period: string) => {
      const res = await api.post<{ ok: true; data: { periodMonth: string; created: number } }>(
        '/api/v1/billing/initialize',
        { period }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export function useResetPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (period: string) => {
      const res = await api.delete<{ ok: true; data: { periodMonth: string; deleted: number } }>(
        `/api/v1/billing/reset/${period}`
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export function useMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put<{ ok: true; data: { id: string; paymentStat: string } }>(
        `/api/v1/billing/pay/${id}`
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export function useUpdateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, initialMeter, finalMeter, notes }: { id: string; initialMeter: number; finalMeter: number; notes?: string }) => {
      const res = await api.put<{ ok: true; data: unknown }>(`/api/v1/billing/meter/${id}`, {
        initialMeter,
        finalMeter,
        notes,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export { getErrorMessage };
