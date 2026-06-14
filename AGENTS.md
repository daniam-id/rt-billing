# AGENTS.md — RT-Billing Admin Dashboard

> Context and instructions for AI coding agents working on this project.

## Project Overview

Monorepo neighborhood billing admin dashboard (pnpm workspaces). Express REST API + Next.js SPA + PostgreSQL.

## Architecture

- **Monorepo:** `apps/api-server` (Express + Prisma) and `apps/admin-web` (Next.js + Tailwind) — npm workspaces
- **Docs:** [PRD](prd.md) | [Architecture](ARCHITECTURE.md) | [Technical Overview](technical_overview.md) | [Plan](rt-billing-mvp.md)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS 3.4, Zustand, TanStack Query v5, Axios |
| Backend | Express.js, TypeScript, Prisma 5, Zod, jsonwebtoken, bcrypt |
| Database | PostgreSQL 15 |
| Deploy | Docker Compose → Coolify |

## Quick Commands

```bash
# Install all
npm install

# Dev servers
npm -w @rt-billing/api-server run dev   # API on :3001
npm -w @rt-billing/admin-web run dev    # Web on :3000

# Database
cd apps/api-server
npx prisma migrate dev --name <name>  # Run migrations
npx prisma db seed                    # Seed default data
npx prisma studio                     # DB browser
npx prisma generate                   # Regenerate client

# Build
npm -w @rt-billing/api-server run build
npm -w @rt-billing/admin-web run build

# Docker
docker compose up --build             # Full stack
docker compose down -v                # Teardown + volumes

# Type check
npm -w @rt-billing/api-server exec tsc --noEmit
npm -w @rt-billing/admin-web exec tsc --noEmit
```

## Project Structure

```
apps/
├── api-server/
│   ├── prisma/          # schema.prisma, seed.ts, migrations/
│   └── src/
│       ├── config/      # Zod-validated env
│       ├── middleware/   # auth.ts (JWT), validate.ts (Zod)
│       ├── routes/      # auth, billing, households, dashboard
│       ├── services/    # Business logic (stateless functions)
│       └── types/       # Shared TS interfaces
└── admin-web/
    └── src/
        ├── app/         # Next.js App Router pages
        ├── components/  # UI atoms + domain components
        ├── context/     # Zustand stores
        ├── hooks/       # TanStack Query hooks
        └── lib/         # Axios instance, QueryClient
```

## Code Patterns

- **Backend:** Route → Service → Prisma. Routes handle HTTP, services handle logic.
- **Frontend:** Page → Hook → Axios → API. Hooks encapsulate queries/mutations.
- **Validation:** Zod on both server (middleware) and client (form validation).
- **Auth:** JWT stateless. `auth.ts` middleware guards all routes except `POST /api/v1/auth/login`.
- **Styling:** Tailwind utility classes only. Clean SaaS tokens: `#FFFFFF`/`#F8FAFC` bg, `#E2E8F0` borders, no shadows, Inter font.

## Conventions

- TypeScript strict mode in both apps
- camelCase for variables/functions, PascalCase for components/types
- API routes prefixed `/api/v1/`
- Period format: `YYYY-MM` (Zod regex validated)
- All DB enums as string unions, not Prisma enums
- Prisma `onDelete: Restrict` on BillRecord FKs
- Passwords hashed with bcrypt (12 rounds)

## Environment Variables

Copy `.env.example` to `.env` in project root. Required:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/rtbilling
JWT_SECRET=your-secret-key
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Critical Rules

- ✅ **ALWAYS consult all 3 files before work:** `AGENTS.md`, `rt-billing-mvp.md`, `technical_overview.md`
- ✅ **MUST update PROGRESS.md before commits**
- ✅ **Maintain consistency with patterns** described above
- ✅ **Document significant changes** in PROGRESS.md
- ✅ **No purple/violet colors** in the UI
- ✅ **No drop shadows** — Clean SaaS spec uses borders only
- ✅ **Create a dedicated branch** for major code changes

## Testing

```bash
# Backend
pnpm --filter api-server test

# Frontend
pnpm --filter admin-web test

# E2E (requires running servers)
python .agents/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000
```

## API Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/login` | ❌ | Login → JWT |
| GET/POST/PUT/DELETE | `/api/v1/households` | ✅ | Household CRUD |
| POST | `/api/v1/billing/initialize` | ✅ | Batch-create period bills |
| DELETE | `/api/v1/billing/reset/:period` | ✅ | Delete unpaid period |
| PUT | `/api/v1/billing/meter/:id` | ✅ | Update PDAM meters |
| PUT | `/api/v1/billing/pay/:id` | ✅ | Mark as paid |
| GET | `/api/v1/dashboard?period=YYYY-MM` | ✅ | KPI aggregation |
