import { prisma } from '../lib/prisma';
import { HttpError } from '../types';

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function assertPeriod(period: string): void {
  if (!PERIOD_REGEX.test(period)) {
    throw new HttpError(400, 'Invalid period format. Expected YYYY-MM');
  }
}

export interface InitializeResult {
  periodMonth: string;
  created: number;
  skipped: number;
}

export async function initializePeriod(periodMonth: string): Promise<InitializeResult> {
  assertPeriod(periodMonth);

  // Block duplicate period
  const existing = await prisma.billRecord.findFirst({
    where: { periodMonth },
    select: { id: true },
  });
  if (existing) {
    throw new HttpError(409, `Period ${periodMonth} has already been initialized`);
  }

  const [households, billTypes] = await Promise.all([
    prisma.household.findMany({ where: { status: 'Active' } }),
    prisma.billType.findMany({ where: { isActive: true } }),
  ]);

  if (households.length === 0 || billTypes.length === 0) {
    throw new HttpError(400, 'No active households or bill types available');
  }

  const records = households.flatMap((h) =>
    billTypes.map((bt) => ({
      householdId: h.id,
      billTypeId: bt.id,
      periodMonth,
      totalAmount: bt.chargeType === 'Flat' ? bt.ratePerUnit : 0,
      paymentStat: 'Pending',
    }))
  );

  const result = await prisma.billRecord.createMany({ data: records });

  return {
    periodMonth,
    created: result.count,
    skipped: 0,
  };
}

export interface ResetResult {
  periodMonth: string;
  deleted: number;
}

export async function resetPeriod(periodMonth: string): Promise<ResetResult> {
  assertPeriod(periodMonth);

  const paidCount = await prisma.billRecord.count({
    where: { periodMonth, paymentStat: 'Paid' },
  });
  if (paidCount > 0) {
    throw new HttpError(
      400,
      `Cannot reset period ${periodMonth}: ${paidCount} paid record(s) exist`
    );
  }

  const result = await prisma.billRecord.deleteMany({ where: { periodMonth } });
  return { periodMonth, deleted: result.count };
}

export interface MeterUpdateInput {
  initialMeter: number;
  finalMeter: number;
  notes?: string | null;
}

export async function updateMeter(id: string, input: MeterUpdateInput) {
  if (input.finalMeter < input.initialMeter) {
    throw new HttpError(400, 'Final meter must be greater than or equal to initial meter');
  }
  if (input.initialMeter < 0 || input.finalMeter < 0) {
    throw new HttpError(400, 'Meter values must be non-negative');
  }

  const record = await prisma.billRecord.findUnique({
    where: { id },
    include: { billType: true },
  });
  if (!record) throw new HttpError(404, 'Bill record not found');
  if (record.billType.chargeType !== 'Variable') {
    throw new HttpError(400, 'Meter can only be set on variable-rate (e.g. PDAM) bills');
  }

  const delta = input.finalMeter - input.initialMeter;
  const totalAmount = Number(record.billType.ratePerUnit) * delta;

  return prisma.billRecord.update({
    where: { id },
    data: {
      initialMeter: input.initialMeter,
      finalMeter: input.finalMeter,
      totalAmount,
      notes: input_notes(input.notes),
    },
  });
}

function input_notes(v: string | null | undefined): string | null {
  if (v === undefined || v === '') return null;
  return v;
}

export async function markPaid(id: string) {
  const record = await prisma.billRecord.findUnique({ where: { id } });
  if (!record) throw new HttpError(404, 'Bill record not found');
  if (record.paymentStat === 'Paid') {
    return record; // idempotent
  }

  return prisma.billRecord.update({
    where: { id },
    data: { paymentStat: 'Paid', paidAt: new Date() },
  });
}

export async function listRecords(periodMonth?: string) {
  return prisma.billRecord.findMany({
    where: periodMonth ? { periodMonth } : undefined,
    include: { household: true, billType: true },
    orderBy: [{ periodMonth: 'desc' }, { household: { houseNumber: 'asc' } }],
  });
}
