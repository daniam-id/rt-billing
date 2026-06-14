import { prisma } from '../lib/prisma';

export interface HouseholdInput {
  houseNumber: string;
  headOfFamily: string;
  phone?: string | null;
  address?: string | null;
  status?: 'Active' | 'Vacant';
  notes?: string | null;
}

export async function listHouseholds() {
  return prisma.household.findMany({
    orderBy: { houseNumber: 'asc' },
  });
}

export async function getHousehold(id: string) {
  return prisma.household.findUnique({ where: { id } });
}

export async function createHousehold(input: HouseholdInput) {
  return prisma.household.create({ data: input });
}

export async function updateHousehold(id: string, input: Partial<HouseholdInput>) {
  return prisma.household.update({ where: { id }, data: input });
}

export async function deleteHousehold(id: string) {
  // BillRecord FK is onDelete: Restrict, so prisma will throw P2003 if records exist.
  return prisma.household.delete({ where: { id } });
}
