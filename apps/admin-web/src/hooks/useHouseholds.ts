'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/axios';

export interface Household {
  id: string;
  houseNumber: string;
  headOfFamily: string;
  phone: string | null;
  address: string | null;
  status: 'Active' | 'Vacant';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdInput {
  houseNumber: string;
  headOfFamily: string;
  phone?: string | null;
  address?: string | null;
  status: 'Active' | 'Vacant';
  notes?: string | null;
}

export function useHouseholds() {
  return useQuery<Household[]>({
    queryKey: ['households'],
    queryFn: async () => {
      const res = await api.get<{ ok: true; data: Household[] }>('/api/v1/households');
      return res.data.data;
    },
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: HouseholdInput) => {
      const res = await api.post<{ ok: true; data: Household }>('/api/v1/households', input);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export function useUpdateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<HouseholdInput> }) => {
      const res = await api.put<{ ok: true; data: Household }>(`/api/v1/households/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export function useDeleteHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/households/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export { getErrorMessage };
