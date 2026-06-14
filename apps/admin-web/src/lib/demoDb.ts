// Mock database backed by localStorage for demo mode.
// Mirrors the real Prisma schema (subset of fields the UI needs).

export interface DemoHousehold {
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

export interface DemoBillType {
  id: string;
  name: string;
  chargeType: 'Flat' | 'Variable';
  ratePerUnit: number;
  unit: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoRecord {
  id: string;
  householdId: string;
  billTypeId: string;
  periodMonth: string;
  totalAmount: number;
  initialMeter: number | null;
  finalMeter: number | null;
  paymentStat: 'Paid' | 'Pending' | 'Overdue';
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoDbShape {
  households: DemoHousehold[];
  billTypes: DemoBillType[];
  records: DemoRecord[];
}

const KEY = 'rt-billing-demo-db';
const SCHEMA_VERSION = 1;

function rid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function now(): string {
  return new Date().toISOString();
}

function seed(): DemoDbShape {
  const t = now();
  const households: DemoHousehold[] = [
    { id: 'h-1', houseNumber: 'A-01', headOfFamily: 'Budi Santoso', phone: '081234567001', address: 'Jl. Mawar No. 1', status: 'Active', notes: null, createdAt: t, updatedAt: t },
    { id: 'h-2', houseNumber: 'A-02', headOfFamily: 'Siti Aminah', phone: '081234567002', address: 'Jl. Mawar No. 2', status: 'Active', notes: null, createdAt: t, updatedAt: t },
    { id: 'h-3', houseNumber: 'A-03', headOfFamily: 'Joko Widodo', phone: '081234567003', address: 'Jl. Mawar No. 3', status: 'Active', notes: null, createdAt: t, updatedAt: t },
    { id: 'h-4', houseNumber: 'B-01', headOfFamily: 'Dewi Lestari', phone: '081234567004', address: 'Jl. Melati No. 1', status: 'Active', notes: null, createdAt: t, updatedAt: t },
    { id: 'h-5', houseNumber: 'B-02', headOfFamily: 'Ahmad Fauzi', phone: '081234567005', address: 'Jl. Melati No. 2', status: 'Vacant', notes: 'Sedang renovasi', createdAt: t, updatedAt: t },
  ];

  const billTypes: DemoBillType[] = [
    { id: 'bt-1', name: 'Iuran Keamanan', chargeType: 'Flat', ratePerUnit: 50000, unit: null, description: 'Iuran bulanan satpam dan keamanan lingkungan', isActive: true, createdAt: t, updatedAt: t },
    { id: 'bt-2', name: 'Iuran Kebersihan', chargeType: 'Flat', ratePerUnit: 25000, unit: null, description: 'Iuran bulanan pengangkutan sampah', isActive: true, createdAt: t, updatedAt: t },
    { id: 'bt-3', name: 'PDAM', chargeType: 'Variable', ratePerUnit: 3500, unit: 'm3', description: 'Tagihan air PDAM (variable, per meter kubik)', isActive: true, createdAt: t, updatedAt: t },
  ];

  // 2026-06 already initialized with 12 records (4 active × 3 types), some paid, some pending.
  // PDAM records start at amount 0 — fill via meter editor in UI.
  const period = '2026-06';
  const active = households.filter((h) => h.status === 'Active');
  const records: DemoRecord[] = [];
  let idx = 0;
  for (const h of active) {
    for (const bt of billTypes) {
      const isPaid = [0, 2, 5, 8, 10].includes(idx);
      const isMeter = bt.chargeType === 'Variable';
      records.push({
        id: `r-${idx + 1}`,
        householdId: h.id,
        billTypeId: bt.id,
        periodMonth: period,
        totalAmount: bt.chargeType === 'Flat' ? bt.ratePerUnit : 0,
        initialMeter: isMeter ? 100 + idx * 10 : null,
        finalMeter: isMeter && idx === 1 ? 145 : null, // 1 PDAM already filled
        paymentStat: isPaid ? 'Paid' : 'Pending',
        paidAt: isPaid ? t : null,
        notes: null,
        createdAt: t,
        updatedAt: t,
      });
      idx++;
    }
  }

  return { households, billTypes, records };
}

function load(): DemoDbShape {
  if (typeof window === 'undefined') return seed();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    const fresh = seed();
    save(fresh);
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as DemoDbShape & { _v?: number };
    if (parsed._v !== SCHEMA_VERSION) {
      const fresh = seed();
      save(fresh);
      return fresh;
    }
    return parsed;
  } catch {
    const fresh = seed();
    save(fresh);
    return fresh;
  }
}

function save(db: DemoDbShape): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify({ ...db, _v: SCHEMA_VERSION }));
}

let _db: DemoDbShape | null = null;
function db(): DemoDbShape {
  if (!_db) _db = load();
  return _db;
}

function commit(): void {
  if (_db) save(_db);
}

export const demoDb = {
  reset(): void {
    _db = seed();
    commit();
  },
  // Households
  listHouseholds(): DemoHousehold[] {
    return [...db().households].sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
  },
  getHousehold(id: string): DemoHousehold | undefined {
    return db().households.find((h) => h.id === id);
  },
  createHousehold(input: Omit<DemoHousehold, 'id' | 'createdAt' | 'updatedAt'>): DemoHousehold {
    const t = now();
    const h: DemoHousehold = { ...input, id: rid(), createdAt: t, updatedAt: t };
    db().households.push(h);
    commit();
    return h;
  },
  updateHousehold(id: string, input: Partial<DemoHousehold>): DemoHousehold | undefined {
    const h = db().households.find((x) => x.id === id);
    if (!h) return undefined;
    Object.assign(h, input, { updatedAt: now() });
    commit();
    return h;
  },
  deleteHousehold(id: string): boolean {
    const before = db().households.length;
    db().households = db().households.filter((x) => x.id !== id);
    const ok = db().households.length < before;
    if (ok) commit();
    return ok;
  },

  // Bill types
  listBillTypes(): DemoBillType[] {
    return db().billTypes;
  },

  // Records
  listRecords(period?: string): DemoRecord[] {
    return db()
      .records.filter((r) => (period ? r.periodMonth === period : true))
      .sort((a, b) => a.periodMonth.localeCompare(b.periodMonth));
  },
  getRecord(id: string): DemoRecord | undefined {
    return db().records.find((r) => r.id === id);
  },
  initializePeriod(period: string): { created: number; period: string } {
    if (db().records.some((r) => r.periodMonth === period)) {
      throw new Error(`Period ${period} already initialized`);
    }
    const active = db().households.filter((h) => h.status === 'Active');
    const t = now();
    let i = 0;
    for (const h of active) {
      for (const bt of db().billTypes) {
        if (!bt.isActive) continue;
        db().records.push({
          id: rid(),
          householdId: h.id,
          billTypeId: bt.id,
          periodMonth: period,
          totalAmount: bt.chargeType === 'Flat' ? bt.ratePerUnit : 0,
          initialMeter: null,
          finalMeter: null,
          paymentStat: 'Pending',
          paidAt: null,
          notes: null,
          createdAt: t,
          updatedAt: t,
        });
        i++;
      }
    }
    commit();
    return { created: i, period };
  },
  resetPeriod(period: string): { deleted: number; period: string } {
    const paid = db().records.filter((r) => r.periodMonth === period && r.paymentStat === 'Paid');
    if (paid.length > 0) {
      throw new Error(`Cannot reset: ${paid.length} paid record(s) exist`);
    }
    const before = db().records.length;
    db().records = db().records.filter((r) => r.periodMonth !== period);
    const deleted = before - db().records.length;
    commit();
    return { deleted, period };
  },
  updateMeter(id: string, initial: number, final: number, notes?: string | null): DemoRecord {
    const r = db().records.find((x) => x.id === id);
    if (!r) throw new Error('Record not found');
    if (final < initial) throw new Error('Final meter must be ≥ initial');
    const bt = db().billTypes.find((b) => b.id === r.billTypeId);
    if (!bt) throw new Error('Bill type not found');
    if (bt.chargeType !== 'Variable') throw new Error('Not a variable bill');
    const delta = final - initial;
    Object.assign(r, {
      initialMeter: initial,
      finalMeter: final,
      totalAmount: bt.ratePerUnit * delta,
      notes: notes ?? null,
      updatedAt: now(),
    });
    commit();
    return r;
  },
  markPaid(id: string): DemoRecord {
    const r = db().records.find((x) => x.id === id);
    if (!r) throw new Error('Record not found');
    r.paymentStat = 'Paid';
    r.paidAt = now();
    r.updatedAt = now();
    commit();
    return r;
  },
  listAvailablePeriods(): string[] {
    return Array.from(new Set(db().records.map((r) => r.periodMonth))).sort().reverse();
  },
  computeKpi(period: string): {
    period: string;
    totalBilled: number;
    totalCollected: number;
    totalArrears: number;
    collectionRate: number;
    paidCount: number;
    pendingCount: number;
    totalCount: number;
  } {
    const recs = db().records.filter((r) => r.periodMonth === period);
    let totalBilled = 0;
    let totalCollected = 0;
    let paidCount = 0;
    for (const r of recs) {
      totalBilled += r.totalAmount;
      if (r.paymentStat === 'Paid') {
        totalCollected += r.totalAmount;
        paidCount++;
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
      pendingCount: recs.length - paidCount,
      totalCount: recs.length,
    };
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
