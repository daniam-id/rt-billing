# RT-Billing MVP — Implementation Plan

## Goal

Build a production-ready monorepo admin dashboard for neighborhood (RT) billing: household CRUD, multi-tier billing engine (flat + variable PDAM), payment tracking, and KPI analytics. Strict Clean SaaS aesthetic, JWT-secured API, Coolify-deployable.

## Project Type

**WEB** (Full-stack monorepo)

## Success Criteria

- [ ] `docker compose up` boots all 3 services (postgres, api-server, admin-web) without errors
- [ ] Admin can login → see dashboard KPIs → filter transactions → mark payments → enter PDAM meters
- [ ] Billing engine correctly computes flat amounts and variable (meter delta × rate) amounts
- [ ] All API routes except `/auth/login` reject unauthenticated requests with 401
- [ ] UI matches Clean SaaS spec: white canvas, slate borders, Inter font, no shadows, dense tables

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | pnpm workspaces | Native, zero-config, fast installs |
| Frontend | Next.js 14 (SPA export) + TypeScript | React ecosystem, static export for Coolify |
| Styling | Tailwind CSS 3.4 | Utility-first, design token control |
| State | Zustand (auth) + TanStack Query v5 (server) | Minimal boilerplate, cache invalidation |
| HTTP | Axios | Interceptor-based JWT injection |
| Backend | Express.js + TypeScript | Lightweight, fast MVP iteration |
| Validation | Zod | Runtime + type inference |
| ORM | Prisma 5 | Type-safe, migration-based schema |
| Database | PostgreSQL 15 | ACID, relational integrity, indexed queries |
| Auth | JWT (jsonwebtoken) | Stateless, Coolify-friendly |
| Container | Docker Compose | Coolify-native deployment |

## File Structure

```
RT-Billing/
├── package.json                    # pnpm workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── api-server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts             # Default admin + bill types + sample households
│   │   └── src/
│   │       ├── index.ts            # Express app entrypoint
│   │       ├── config/
│   │       │   └── env.ts          # Zod-validated env vars
│   │       ├── middleware/
│   │       │   ├── auth.ts         # JWT verification guard
│   │       │   └── validate.ts     # Zod request validation wrapper
│   │       ├── routes/
│   │       │   ├── auth.ts         # POST /login
│   │       │   ├── households.ts   # CRUD
│   │       │   ├── billing.ts      # initialize, reset, meter, pay
│   │       │   └── dashboard.ts    # KPI aggregation
│   │       ├── services/
│   │       │   ├── auth.service.ts
│   │       │   ├── household.service.ts
│   │       │   ├── billing.service.ts
│   │       │   └── dashboard.service.ts
│   │       └── types/
│   │           └── index.ts        # Shared request/response types
│   │
│   └── admin-web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── src/
│           ├── app/
│           │   ├── layout.tsx      # Root layout (Inter font, global providers)
│           │   ├── page.tsx        # Dashboard (KPI + Transaction Matrix)
│           │   ├── login/
│           │   │   └── page.tsx
│           │   └── households/
│           │       └── page.tsx    # Household CRUD table
│           ├── components/
│           │   ├── ui/             # Badge, Button, Input, Modal, Table atoms
│           │   ├── KPIGrid.tsx
│           │   ├── TransactionTable.tsx
│           │   ├── MeterEditor.tsx
│           │   ├── HouseholdTable.tsx
│           │   └── Navbar.tsx
│           ├── context/
│           │   └── useAuthStore.ts  # Zustand JWT store
│           ├── lib/
│           │   ├── axios.ts         # Axios instance + interceptor
│           │   └── queryClient.ts   # TanStack QueryClient config
│           ├── hooks/
│           │   ├── useDashboard.ts
│           │   ├── useBilling.ts
│           │   └── useHouseholds.ts
│           └── styles/
│               └── globals.css      # Tailwind directives + Clean SaaS tokens
```

## Tasks

### Task 1: Monorepo Scaffold + Workspace Config

- **Agent:** `backend-specialist` | **Skill:** `nodejs-best-practices`
- **Priority:** P0 | **Dependencies:** None
- **INPUT:** Empty project root (only prd.md, ARCHITECTURE.md exist)
- **OUTPUT:** Root `package.json` (pnpm workspaces), `pnpm-workspace.yaml`, both app `package.json` files with all dependencies, `tsconfig.json` files, `.env.example`
- **VERIFY:** `pnpm install` completes. `pnpm -r list` shows both workspaces.

### Task 2: Prisma Schema + Seed Script

- **Agent:** `database-architect` | **Skill:** `database-design`
- **Priority:** P0 | **Dependencies:** Task 1
- **INPUT:** Schema spec from PRD §4.2 + user requirements
- **OUTPUT:** `prisma/schema.prisma` with User, Household, BillType, BillRecord models. Unique constraint `[householdId, billTypeId, periodMonth]`. Index `[householdId, periodMonth, paymentStat]`. `prisma/seed.ts` with default admin (hashed password), 3 bill types, 5 sample households.
- **VERIFY:** `npx prisma validate` passes. `npx prisma migrate dev --name init` creates tables. `npx prisma db seed` populates data. `npx prisma studio` shows all 4 tables with correct relations.

### Task 3: Express Server + Auth + Middleware

- **Agent:** `backend-specialist` | **Skill:** `api-patterns`
- **Priority:** P1 | **Dependencies:** Task 2
- **INPUT:** Prisma Client generated from Task 2
- **OUTPUT:** Express entrypoint (`src/index.ts`), Zod env config, JWT auth middleware (guards all routes except `POST /api/v1/auth/login`), Zod validation middleware wrapper, `POST /api/v1/auth/login` route returning JWT on valid credentials.
- **VERIFY:** Server starts on port 3001. `curl POST /api/v1/auth/login` with valid creds → 200 + JWT. Any other route without Bearer → 401.

### Task 4: Billing & Household API Routes

- **Agent:** `backend-specialist` | **Skill:** `api-patterns`
- **Priority:** P1 | **Dependencies:** Task 3
- **INPUT:** Auth middleware + Prisma Client
- **OUTPUT:**
  - `POST /api/v1/billing/initialize` — Block duplicate period, create flat + variable records
  - `DELETE /api/v1/billing/reset/:period` — Bulk delete only if zero "Paid" records
  - `PUT /api/v1/billing/meter/:id` — Validate final≥initial, compute totalAmount
  - `PUT /api/v1/billing/pay/:id` — Set "Paid" + server timestamp
  - `GET /api/v1/dashboard` — Aggregate KPIs (total billed, collected, arrears, collection rate)
  - Household CRUD: `GET/POST/PUT/DELETE /api/v1/households`
- **VERIFY:** Full curl test suite:
  - Initialize June 2026 → 201. Re-initialize → 409.
  - Update meter (final < initial) → 400. Valid meter → 200 + correct totalAmount.
  - Pay a record → paymentStat="Paid", paidAt set.
  - Reset period with paid record → 400. Reset clean period → 200.
  - Dashboard returns correct aggregated values.

### Task 5: Frontend Scaffold + Auth Layer

- **Agent:** `frontend-specialist` | **Skill:** `nextjs-react-expert`
- **Priority:** P2 | **Dependencies:** Task 1
- **INPUT:** Next.js app in `apps/admin-web`
- **OUTPUT:** Next.js config (SPA-compatible), Tailwind config with Clean SaaS tokens (`#FFFFFF`, `#F8FAFC`, `#E2E8F0`, `#2563EB`, `#10B981`, `#EF4444`), Inter font via `next/font`, globals.css, Zustand auth store (`useAuthStore.ts`), Axios instance with JWT interceptor, TanStack QueryClient provider, root layout with providers, login page.
- **VERIFY:** `pnpm --filter admin-web dev` starts. Login page renders with Clean SaaS styling. Submitting valid credentials stores JWT in Zustand. Subsequent Axios requests include Bearer header.

### Task 6: Dashboard + KPI Grid + Transaction Table

- **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
- **Priority:** P2 | **Dependencies:** Task 4, Task 5
- **INPUT:** Working API + auth layer
- **OUTPUT:** Dashboard page (`/`) with:
  - Period selector (month picker)
  - KPI Grid: 4 cards (Total Billed, Collected, Arrears, Collection Rate %) using data from `GET /api/v1/dashboard`
  - Transaction Table: columns [House No, Head of Family, Bill Type, Amount, Status, Action]. Status badges (emerald "Paid", red "Overdue"/"Pending"). "Mark Paid" button triggers `PUT /pay/:id` + React Query invalidation.
  - Filters: Status dropdown, Bill Type dropdown, house number search.
- **VERIFY:** Dashboard loads with real data. KPI numbers match manual calculation. Clicking "Mark Paid" → badge flips to green, KPI updates. Filters narrow table rows correctly.

### Task 7: PDAM Meter Editor + Household Management

- **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
- **Priority:** P2 | **Dependencies:** Task 6
- **INPUT:** Working dashboard + billing API
- **OUTPUT:**
  - MeterEditor component: inline initial/final meter inputs on PDAM bill rows. On blur/submit → `PUT /meter/:id`. Validation (final ≥ initial) client-side + server-side. React Query cache invalidation on success.
  - Households page (`/households`): CRUD table with inline add/edit modal, delete with confirmation dialog. Status toggle (Active/Vacant).
- **VERIFY:** Enter meter values → totalAmount updates in table. Invalid meter (final < initial) → inline error. Household CRUD operations reflect in database.

### Task 8: Docker Compose + Dockerfiles

- **Agent:** `devops-engineer` | **Skill:** `deployment-procedures`
- **Priority:** P3 | **Dependencies:** Task 4, Task 7
- **INPUT:** Working apps
- **OUTPUT:** Root `docker-compose.yml` with 3 services (postgres:15-alpine + pgdata volume, api-server on 3001, admin-web on 3000). Individual `Dockerfile` per app (multi-stage builds). `.dockerignore` files.
- **VERIFY:** `docker compose build` succeeds. `docker compose up` → all 3 healthy. `curl localhost:3001/api/v1/auth/login` responds. `curl localhost:3000` serves frontend.

### Task 9: Navbar + Polish + Route Guards

- **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
- **Priority:** P3 | **Dependencies:** Task 7
- **INPUT:** All pages built
- **OUTPUT:** Navbar component (Dashboard, Households, Invoices & Rates, Transaction Ledger tabs per PRD wireframe). Client-side route guard (redirect to /login if no JWT). Logout button clearing Zustand store. Loading skeletons. Empty states. Error boundaries. Responsive table scroll on mobile.
- **VERIFY:** Unauthenticated visit → redirect to /login. Nav highlights active page. All pages accessible. Logout clears session.

## Phase X: Verification Checklist

- [ ] `pnpm install` — zero errors
- [ ] `pnpm --filter api-server build` — TypeScript compiles clean
- [ ] `pnpm --filter admin-web build` — Next.js builds clean
- [ ] `npx prisma validate` — schema valid
- [ ] `docker compose up` — all services healthy
- [ ] Auth flow: login → JWT → protected routes → logout
- [ ] Billing flow: initialize → meter entry → mark paid → KPI update
- [ ] Reset flow: block if paid exists, allow if clean
- [ ] UI audit: no shadows, white canvas, slate borders, Inter font, dense tables
- [ ] No purple/violet hex codes in codebase
- [ ] `python .agents/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] `python .agents/skills/frontend-design/scripts/ux_audit.py .`

## Dependency Graph

```
Task 1 (Scaffold)
├── Task 2 (Schema) ──→ Task 3 (Auth API) ──→ Task 4 (Billing API) ──┐
│                                                                      ├──→ Task 8 (Docker)
└── Task 5 (Frontend Scaffold) ──→ Task 6 (Dashboard) ──→ Task 7 (PDAM + Households) ──→ Task 9 (Polish)
```

**Parallelism:** Tasks 2+5 can run in parallel after Task 1. Tasks 8+9 can run in parallel after their deps.

## Notes

- **Password hashing:** Use bcrypt (12 rounds) for admin password in seed and login
- **JWT expiry:** 24h for MVP, configurable via env
- **Period format:** Strict `YYYY-MM` validated by Zod regex
- **Prisma `onDelete: Restrict`** on BillRecord FKs to prevent cascade deletes of household/bill type data
- **No SSR needed:** Next.js configured for client-side SPA (`output: 'export'` or fully client-rendered pages)
- **Memory convention:** Create dedicated branch before implementation per MEMORY.md
