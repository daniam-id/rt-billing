import { prisma } from '../lib/prisma';
import { assertPeriod } from './billing.service';
import { HttpError } from '../types';

export interface DashboardKPI {
  period: string;
  totalBilled: number;
  totalCollected: number;
  totalArrears: number;
  collectionRate: number; // 0..1
  paidCount: number;
  pendingCount: number;
  totalCount: number;
}

export async function getDashboard(period: string): Promise<DashboardKPI> {
  assertPeriod(period);

  const records = await prisma.billRecord.findMany({
    where: { periodMonth: period },
    select: { totalAmount: true, paymentStat: true },
  });

  let totalBilled = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let pendingCount = 0;

  for (const r of records) {
    const amt = Number(r.totalAmount);
    totalBilled += amt;
    if (r.paymentStat === 'Paid') {
      totalCollected += amt;
      paidCount++;
    } else {
      pendingCount++;
    }
  }

  const totalArrears = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? totalCollected / totalBilled : 0;

  return {
    period,
    totalBilled: round2(totalBilled),
    totalCollected: round2(totalCollected),
    totalArrears: round2(totalArrears),
    collectionRate: Math.round(collectionRate * 10000) / 10000,
    paidCount,
    pendingCount,
    totalCount: records.length,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function listAvailablePeriods(): Promise<string[]> {
  const rows = await prisma.billRecord.findMany({
    distinct: ['periodMonth'],
    select: { periodMonth: true },
    orderBy: { periodMonth: 'desc' },
  });
  return rows.map((r) => r.periodMonth);
}

export async function ensurePeriod(period: string): Promise<void> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    throw new HttpError(400, 'Invalid period format');
  }
}
