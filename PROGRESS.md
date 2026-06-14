# PROGRESS.md — RT-Billing Admin Dashboard

> Track every progress made by AI before GitHub commits. **MUST update before every commit.**

---

## Project Timeline

| Date | Phase | Summary |
|------|-------|---------|
| 2026-06-14 | Planning | PRD finalized, ARCHITECTURE.md written, rt-billing-mvp.md plan created |
| 2026-06-14 | Init | technical_overview.md, AGENTS.md, PROGRESS.md created |
| 2026-06-14 | Refactor | Replaced top Navbar with fixed left Sidebar (w-64) + scrollable main area; mobile slide-out sheet |

---

## Completed

### Phase: Planning & Documentation
- [x] PRD v1.0.0 finalized (`prd.md`)
- [x] System architecture documented (`ARCHITECTURE.md`)
- [x] MVP implementation plan created (`rt-billing-mvp.md`) — 9 tasks, 4 priority tiers
- [x] Technical overview generated (`technical_overview.md`)
- [x] AGENTS.md created with project context and conventions
- [x] PROGRESS.md initialized

### Phase: Implementation
- [x] **Task 1: Monorepo Scaffold** — pnpm workspace root, both app `package.json`/`tsconfig`, `.env.example`, `.gitignore`
- [x] **Task 2: Prisma Schema + Seed** — 4 models (User, Household, BillType, BillRecord) with composite unique/index; bcryptjs-hashed admin + 3 bill types + 5 households seed
- [x] **Task 3: Express + Auth + Middleware** — Zod env config (auto-detect .env in root/cwd/local), JWT auth guard, Zod validate wrapper, global error handler, `POST /api/v1/auth/login`
- [x] **Task 4: Billing & Household API** — initialize/reset/meter/pay endpoints, household CRUD, dashboard KPI aggregation, periods list
- [x] **Task 5: Frontend Scaffold + Auth** — Next.js layout with Inter font, Zustand auth store (localStorage persistence), Axios with JWT interceptor, TanStack Query provider, login page
- [x] **Task 6: Dashboard + KPI + Transactions** — PeriodSelector, KPIGrid (4 cards), TransactionTable with status/type/search filters, Dashboard page wiring it all
- [x] **Task 7: Meter Editor + Households** — inline MeterEditor for PDAM rows (client+server validation), HouseholdTable with create/edit/delete modal, `/households` page
- [x] **Task 8: Docker Compose + Dockerfiles** — root multi-stage Dockerfile (api + nginx-served static web), `docker-compose.yml` with postgres+api+web healthchecks, nginx.conf for SPA routing, `.dockerignore` files
- [x] **Task 9: Navbar + Polish + Route Guards** — Navbar with active-tab highlight + logout, `(app)` route group with ProtectedShell, ErrorBoundary in root layout, `/invoices` and `/ledger` pages
- [x] **Refactor: Sidebar Layout** — Replaced top Navbar with fixed left Sidebar (`w-64 h-screen`, `bg-canvas border-r border-border`), scrollable `<main>` on the right, mobile slide-out sheet via hamburger. Active route uses `bg-blue-50` + 3px brand left bar. User/Logout pinned to bottom of sidebar. Files: `Sidebar.tsx` (new), `ProtectedShell.tsx` (rewritten), `Navbar.tsx` (deleted).

### Adaptations for sandbox (no Docker, no Postgres)
- Switched Prisma datasource to **SQLite** for dev (zero-install). Production still uses Postgres via docker-compose — change `provider` back to `"postgresql"` and run with Docker.
- Switched `bcrypt` → `bcryptjs` (pure JS, no native compile needed for gcc/python).
- Created `.env` files in `apps/api-server/` and `apps/admin-web/` (gitignored) from `.env.example`.

### Smoke test (live)
- [x] `GET /health` → 200 OK
- [x] `POST /api/v1/auth/login` → 200 + JWT
- [x] Unauth `GET /api/v1/households` → 401
- [x] Auth `GET /api/v1/households` → 5 records (Budi Santoso, Siti Aminah, Joko Widodo, Dewi Lestari, Ahmad Fauzi)
- [x] `POST /api/v1/billing/initialize` for 2026-06 → 12 records (4 active × 3 bill types), totalBilled = IDR 300,000
- [x] Re-initialize 2026-06 → 409 Conflict
- [x] `PUT /api/v1/billing/pay/:id` → paymentStat="Paid", paidAt set; dashboard updates to totalCollected=50000, collectionRate=0.1667
- [x] `GET /api/v1/dashboard?period=2026-06` → correct KPI aggregation
- [x] `GET http://localhost:3000/login/` → serves HTML with title "RT-Billing Admin", "Sign in" form
- [x] Both servers listening: API :3001, Web :3000

---

## File Manifest

```
RT-Billing/
├── package.json                          # pnpm workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml
├── Dockerfile                            # Multi-stage: api + static web (nginx)
├── .env.example
├── .gitignore
├── .dockerignore
├── apps/
│   ├── api-server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .gitignore
│   │   ├── .dockerignore
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # User, Household, BillType, BillRecord
│   │   │   └── seed.ts                   # admin/admin123, 3 bill types, 5 households
│   │   └── src/
│   │       ├── index.ts                  # Express bootstrap
│   │       ├── config/env.ts             # Zod-validated env
│   │       ├── lib/prisma.ts             # Singleton Prisma client
│   │       ├── middleware/
│   │       │   ├── auth.ts               # JWT guard
│   │       │   ├── validate.ts           # Zod request wrapper
│   │       │   └── errorHandler.ts       # Global handler (HttpError, Zod, Prisma)
│   │       ├── services/
│   │       │   ├── auth.service.ts
│   │       │   ├── household.service.ts
│   │       │   ├── billing.service.ts    # initialize/reset/meter/pay
│   │       │   └── dashboard.service.ts  # KPI aggregation
│   │       ├── routes/
│   │       │   ├── auth.ts               # POST /login (public)
│   │       │   ├── households.ts         # CRUD
│   │       │   ├── billing.ts            # initialize/reset/meter/pay/records
│   │       │   └── dashboard.ts          # GET /?period, GET /periods
│   │       └── types/index.ts            # HttpError, ApiResponse helpers
│   │
│   └── admin-web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js                # output: 'export'
│       ├── tailwind.config.ts            # Clean SaaS tokens
│       ├── postcss.config.js
│       ├── next-env.d.ts
│       ├── nginx.conf                    # SPA routing
│       ├── .gitignore
│       ├── .dockerignore
│       └── src/
│           ├── app/
│           │   ├── layout.tsx            # Root: Inter, Providers, ErrorBoundary
│           │   ├── providers.tsx         # QueryClientProvider + AuthHydrator
│           │   ├── login/page.tsx        # Public
│           │   └── (app)/                # Protected route group
│           │       ├── layout.tsx        # ProtectedShell
│           │       ├── page.tsx          # Dashboard
│           │       ├── households/page.tsx
│           │       ├── invoices/page.tsx
│           │       └── ledger/page.tsx
│           ├── components/
│           │   ├── Navbar.tsx
│           │   ├── ProtectedShell.tsx
│           │   ├── ErrorBoundary.tsx
│           │   ├── KPIGrid.tsx
│           │   ├── PeriodSelector.tsx
│           │   ├── TransactionTable.tsx
│           │   ├── MeterEditor.tsx
│           │   ├── HouseholdTable.tsx
│           │   └── ui/
│           │       ├── index.tsx         # Button, Input, Select, Badge, Th, Td, EmptyState
│           │       └── Modal.tsx
│           ├── context/
│           │   ├── useAuthStore.ts       # Zustand + localStorage
│           │   └── AuthHydrator.tsx
│           ├── hooks/
│           │   ├── useBilling.ts         # useDashboard, useBillingRecords, usePeriods
│           │   ├── useMutations.ts       # initialize, reset, markPaid, updateMeter
│           │   └── useHouseholds.ts
│           ├── lib/
│           │   ├── axios.ts              # Axios + JWT interceptor + 401 redirect
│           │   └── queryClient.ts
│           └── styles/globals.css        # Tailwind + Clean SaaS resets
```

---

## Next: Phase X Verification

After `npm install` and `docker compose up --build`, run:
- [ ] `npm -w @rt-billing/api-server run build` — must compile clean
- [ ] `npm -w @rt-billing/admin-web run build` — must compile clean
- [ ] `curl -X POST http://localhost:3001/api/v1/auth/login -d '{"username":"admin","password":"admin123"}' -H 'Content-Type: application/json'`
- [ ] Smoke test initialize → meter → pay → dashboard flow
- [ ] UI audit: no shadows, white canvas, slate borders, Inter font, dense tables
- [ ] No purple/violet hex codes

---

## Pending (from rt-billing-mvp.md)

- [ ] Task 1: Monorepo Scaffold + Workspace Config
- [ ] Task 2: Prisma Schema + Seed Script
- [ ] Task 3: Express Server + Auth + Middleware
- [ ] Task 4: Billing & Household API Routes
- [ ] Task 5: Frontend Scaffold + Auth Layer
- [ ] Task 6: Dashboard + KPI Grid + Transaction Table
- [ ] Task 7: PDAM Meter Editor + Household Management
- [ ] Task 8: Docker Compose + Dockerfiles
- [ ] Task 9: Navbar + Polish + Route Guards
- [ ] Phase X: Final Verification

---

## Bug Fixes

_None yet._

---

## Notes

- Branch convention: create dedicated branch before major code changes
- Plan file: `rt-billing-mvp.md` is the source of truth for task status
- Update this file **before every commit** with what was changed and why
