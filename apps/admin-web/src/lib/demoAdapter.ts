// Mock API router for demo mode. Returns shapes identical to the real backend.
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { demoDb, type DemoRecord } from './demoDb';

interface Route {
  method: string;
  pattern: RegExp;
  handle: (params: Record<string, string>, body: unknown, query: Record<string, string>) => unknown;
}

function buildRecord(r: DemoRecord) {
  const household = demoDb.getHousehold(r.householdId);
  const billType = demoDb.listBillTypes().find((b) => b.id === r.billTypeId);
  return { ...r, household, billType };
}

const routes: Route[] = [
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/login$/,
    handle: () => ({
      ok: true,
      data: {
        token: 'demo-token-' + Date.now().toString(36),
        user: { id: 'u-1', username: 'admin', fullName: 'RT Administrator (Demo)', role: 'admin' },
      },
    }),
  },

  // Households
  { method: 'GET', pattern: /^\/api\/v1\/households$/, handle: () => ({ ok: true, data: demoDb.listHouseholds() }) },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/households$/,
    handle: (_p, body) => ({ ok: true, data: demoDb.createHousehold(body as never) }),
  },
  {
    method: 'PUT',
    pattern: /^\/api\/v1\/households\/(.+)$/,
    handle: (p, body) => {
      const data = demoDb.updateHousehold(p[1]!, body as never);
      if (!data) throw new HttpErr(404, 'Not found');
      return { ok: true, data };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/v1\/households\/(.+)$/,
    handle: (p) => {
      if (!demoDb.deleteHousehold(p[1]!)) throw new HttpErr(404, 'Not found');
      return { ok: true, data: null };
    },
  },

  // Billing
  {
    method: 'POST',
    pattern: /^\/api\/v1\/billing\/initialize$/,
    handle: (_p, body) => {
      const { period } = body as { period: string };
      try {
        const data = demoDb.initializePeriod(period);
        return { ok: true, data: { periodMonth: data.period, created: data.created, skipped: 0 } };
      } catch (e) {
        throw new HttpErr(409, (e as Error).message);
      }
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/v1\/billing\/reset\/(.+)$/,
    handle: (p) => {
      try {
        const data = demoDb.resetPeriod(p[1]!);
        return { ok: true, data };
      } catch (e) {
        throw new HttpErr(400, (e as Error).message);
      }
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/v1\/billing\/meter\/(.+)$/,
    handle: (p, body) => {
      const { initialMeter, finalMeter, notes } = body as { initialMeter: number; finalMeter: number; notes?: string | null };
      try {
        const r = demoDb.updateMeter(p[1]!, initialMeter, finalMeter, notes);
        return { ok: true, data: buildRecord(r) };
      } catch (e) {
        throw new HttpErr(400, (e as Error).message);
      }
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/v1\/billing\/pay\/(.+)$/,
    handle: (p) => {
      try {
        const r = demoDb.markPaid(p[1]!);
        return { ok: true, data: buildRecord(r) };
      } catch (e) {
        throw new HttpErr(404, (e as Error).message);
      }
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/billing\/records$/,
    handle: (_p, _b, query) => {
      const period = query.period;
      return { ok: true, data: demoDb.listRecords(period).map(buildRecord) };
    },
  },

  // Dashboard
  {
    method: 'GET',
    pattern: /^\/api\/v1\/dashboard$/,
    handle: (_p, _b, query) => ({ ok: true, data: demoDb.computeKpi(query.period!) }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/dashboard\/periods$/,
    handle: () => ({ ok: true, data: demoDb.listAvailablePeriods() }),
  },
];

class HttpErr extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

function paramsFromUrl(url: string): { path: string; query: Record<string, string> } {
  const [path, qs = ''] = url.split('?');
  const query: Record<string, string> = {};
  new URLSearchParams(qs).forEach((v, k) => (query[k] = v));
  return { path: path ?? url, query };
}

export const demoAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  // Simulate small network latency for realism
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));

  const method = (config.method ?? 'get').toUpperCase();
  const url = config.url ?? '';
  const { path, query } = paramsFromUrl(url);
  let body: unknown = undefined;
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  for (const route of routes) {
    if (route.method !== method) continue;
    const m = path.match(route.pattern);
    if (!m) continue;
    const params: Record<string, string> = {};
    if (m[1]) params[1] = m[1];
    try {
      const data = route.handle(params, body, query);
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    } catch (e) {
      if (e instanceof HttpErr) {
        return {
          data: { ok: false, error: e.message },
          status: e.status,
          statusText: e.message,
          headers: {},
          config,
        } as AxiosResponse;
      }
      throw e;
    }
  }

  return {
    data: { ok: false, error: `Demo route not found: ${method} ${path}` },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
  } as AxiosResponse;
};
