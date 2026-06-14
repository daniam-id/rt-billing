# Technical Overview — RT-Billing Admin Dashboard

## 1. Core Components

### 1.1 Frontend SPA (`apps/admin-web`)

| Module | Responsibility |
|--------|---------------|
| `src/app/` | Next.js App Router pages — Dashboard, Login, Households |
| `src/components/` | Reusable UI atoms (Badge, Button, Modal) and domain components (KPIGrid, TransactionTable, MeterEditor, HouseholdTable, Navbar) |
| `src/context/useAuthStore.ts` | Zustand store — JWT token persistence, auth state, logout action |
| `src/lib/axios.ts` | Axios instance with request interceptor injecting `Authorization: Bearer <token>` |
| `src/lib/queryClient.ts` | TanStack Query v5 client — stale time, retry config, global error handling |
| `src/hooks/` | Custom React Query hooks (`useDashboard`, `useBilling`, `useHouseholds`) encapsulating API calls + cache invalidation |
| `src/styles/globals.css` | Tailwind directives + Clean SaaS design tokens |

**Design pattern:** Feature-based colocation. Each page imports domain-specific hooks and components. State split: Zustand (client auth) vs TanStack Query (server cache).

### 1.2 Backend REST API (`apps/api-server`)

| Module | Responsibility |
|--------|---------------|
| `src/index.ts` | Express app bootstrap — CORS, JSON parser, route mounting, error handler |
| `src/config/env.ts` | Zod-validated environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`) |
| `src/middleware/auth.ts` | JWT verification guard — extracts Bearer token, verifies with `jsonwebtoken`, attaches decoded payload to `req.user` |
| `src/middleware/validate.ts` | Generic Zod schema validation middleware — validates `req.body`, `req.params`, `req.query` |
| `src/routes/` | Express Router definitions per domain (auth, billing, households, dashboard) |
| `src/services/` | Business logic layer — stateless functions consuming Prisma Client, returning typed results |
| `src/types/index.ts` | Shared TypeScript interfaces for request/response payloads |
| `prisma/schema.prisma` | Declarative database schema — 4 models (User, Household, BillType, BillRecord) |
| `prisma/seed.ts` | Database seeder — default admin (bcrypt-hashed), 3 bill types, 5 sample households |

**Design pattern:** Service layer pattern. Routes handle HTTP concerns (parsing, status codes). Services handle domain logic (calculations, validations). Prisma Client is the sole data access mechanism.

### 1.3 Database Layer (PostgreSQL 15)

4 tables with relational integrity:

| Table | Key Constraints |
|-------|----------------|
| `User` | `username` unique |
| `Household` | `houseNumber` unique, `status` enum (Active/Vacant) |
| `BillType` | `name` unique, `chargeType` enum (Flat/Variable) |
| `BillRecord` | Composite unique `[householdId, billTypeId, periodMonth]`, composite index `[householdId, periodMonth, paymentStat]`, FK `onDelete: Restrict` |

---

## 2. Component Interactions

### 2.1 Data Flow

```
Browser (Next.js SPA)
  │
  ├─ Zustand: stores JWT in memory
  ├─ Axios interceptor: attaches Bearer token to every request
  ├─ TanStack Query: manages server state cache
  │
  ▼ HTTPS / JSON
Express API (port 3001)
  │
  ├─ CORS middleware: allows admin-web origin
  ├─ Auth middleware: verifies JWT on all routes except POST /auth/login
  ├─ Zod middleware: validates request payloads
  ├─ Route → Service → Prisma Client
  │
  ▼ TCP / PostgreSQL protocol
PostgreSQL (port 5432)
  │
  └─ Prisma connection pool (default 5 connections)
```

### 2.2 Key API Surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/auth/login` | Authenticate admin → return JWT |
| `GET/POST/PUT/DELETE` | `/api/v1/households` | Household CRUD |
| `POST` | `/api/v1/billing/initialize` | Batch-create bills for a period |
| `DELETE` | `/api/v1/billing/reset/:period` | Bulk delete unpaid period records |
| `PUT` | `/api/v1/billing/meter/:id` | Update PDAM meter → auto-compute amount |
| `PUT` | `/api/v1/billing/pay/:id` | Toggle payment status to "Paid" |
| `GET` | `/api/v1/dashboard?period=YYYY-MM` | Aggregated KPI metrics |

### 2.3 Communication Pattern

- **Auth:** Stateless JWT. No session store. Token stored in Zustand (memory-only, lost on refresh in MVP). 24h expiry.
- **Data fetching:** TanStack Query `useQuery` for reads, `useMutation` + `queryClient.invalidateQueries` for writes.
- **Validation:** Dual-layer — client-side form validation + server-side Zod schemas. Server is source of truth.

---

## 3. Deployment Architecture

### 3.1 Containerization

```yaml
# docker-compose.yml — 3 services
services:
  postgres:    # PostgreSQL 15 Alpine, volume: pgdata
  api-server:  # Node.js 20, port 3001, depends_on: postgres
  admin-web:   # Next.js, port 3000, env: NEXT_PUBLIC_API_URL
```

### 3.2 Build Steps

| Service | Build | Command |
|---------|-------|---------|
| `api-server` | Multi-stage Dockerfile | `pnpm install` → `npx prisma generate` → `tsc` → `node dist/index.js` |
| `admin-web` | Multi-stage Dockerfile | `pnpm install` → `next build` → `next start` (or static export) |
| `postgres` | Official image | Auto-init via Prisma migrations |

### 3.3 Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | api-server | PostgreSQL connection string |
| `JWT_SECRET` | api-server | JWT signing key |
| `PORT` | api-server | Server port (default 3001) |
| `NEXT_PUBLIC_API_URL` | admin-web | API base URL for Axios |

### 3.4 Target Platform

Coolify (self-hosted PaaS). Docker Compose is the deployment unit. Coolify manages reverse proxy, SSL termination, and container orchestration.

---

## 4. Runtime Behavior

### 4.1 Application Initialization

**API Server startup sequence:**
1. Load and validate env vars via Zod (`config/env.ts`)
2. Initialize Prisma Client (lazy connection on first query)
3. Mount middleware stack: CORS → JSON parser → Auth guard → Routes
4. Bind to `PORT` (3001)

**Frontend startup sequence:**
1. Next.js hydrates root layout (Inter font, QueryClientProvider, auth check)
2. Zustand store initializes (checks for existing JWT)
3. If no valid JWT → redirect to `/login`
4. If valid JWT → render Dashboard, fire TanStack Query fetches

### 4.2 Request Lifecycle (Example: Mark Payment)

1. User clicks "Mark Paid" button on TransactionTable row
2. `useBilling` hook fires `mutation.mutate(billId)`
3. Axios sends `PUT /api/v1/billing/pay/:id` with Bearer token
4. Express auth middleware validates JWT
5. Billing service updates `paymentStat = "Paid"`, `paidAt = new Date()`
6. Response 200 returns updated record
7. TanStack Query invalidates `["dashboard"]` and `["billing"]` query keys
8. KPI grid and table re-render with fresh data

### 4.3 Business Workflow: Billing Cycle

1. **Initialize period:** Admin selects month → `POST /billing/initialize` → system creates BillRecords for all Active households × all BillTypes. Flat types get immediate `totalAmount`. PDAM types get `totalAmount = 0`.
2. **Enter meters:** Admin inputs PDAM meter readings per household → `PUT /billing/meter/:id` → system validates `final >= initial`, computes `totalAmount = delta * ratePerUnit`.
3. **Collect payments:** As residents pay, admin clicks "Mark Paid" → `PUT /billing/pay/:id`.
4. **Monitor:** Dashboard KPIs update in real-time showing collection rate, arrears, revenue.
5. **Reset (if needed):** Admin can delete a period's records ONLY if none are marked "Paid" → `DELETE /billing/reset/:period`.

### 4.4 Error Handling

- **API errors:** Express global error handler catches thrown errors, returns structured JSON `{ error: string, details?: any }` with appropriate HTTP status.
- **Validation errors:** Zod parse failures return 400 with field-level error messages.
- **Auth errors:** Invalid/expired JWT returns 401. Missing token returns 401.
- **Business rule violations:** Duplicate period → 409. Paid records exist on reset → 400. Invalid meter delta → 400.
- **Frontend errors:** TanStack Query `onError` callbacks show toast notifications. React Error Boundary wraps page-level crashes.
