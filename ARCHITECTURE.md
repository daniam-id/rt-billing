# System Architecture Document

## 1. Executive Technical Overview
This document delineates the architectural topology, data flow mechanics, technology stack selection, and structural patterns governing the RT-Billing Admin Dashboard platform. The system is designed under a decoupled single-page application (SPA) model interacting with a stateless RESTful API, optimized for rapid transactional mutation, low-latency rendering of tabular datasets, and extreme interface clarity.

---

## 2. Technology Stack Selection

### 2.1 Frontend Tier (Client Application)
- **Framework:** React.js (via Next.js in SPA/Client-side Rendering mode) to facilitate component lifecycle predictability and fast visual updates.
- **Styling Architecture:** Tailwind CSS utilizing an uncompromised Utility-First CSS paradigm and strict structural design tokens.
- **State Management:** React Context API or Zustand for local asynchronous ledger filtering and query persistence.
- **Data Fetching:** Axios or TanStack Query (React Query) featuring automatic cache invalidation on ledger mutation.

### 2.2 Backend Tier (Application Server)
- **Runtime Environment:** Node.js (v20+ LTS).
- **Framework:** Express.js or NestJS configured for strictly decoupled RESTful JSON operations.
- **Database Access Layer:** Prisma ORM or TypeORM to provide type-safe programmatic schema manipulation and connection pooling.

### 2.3 Database Tier (Persistence)
- **Engine:** PostgreSQL (v15+), chosen for ACID compliance, relational structural integrity, and robust indexing capabilities over dynamic date-range queries.

---

## 3. Structural System Topography

```
+-----------------------------------------------------------------------------+
|                                CLIENT TIER                                  |
|   Next.js SPA Engine | Zustand Cache State | Tailwind Token Layouts         |
+-------------------------------------+---------------------------------------+
                                      |
                                      | HTTPS / JSON Payload
                                      v
+-----------------------------------------------------------------------------+
|                           API GATEWAY / ROUTER LAYER                        |
|   Rate Limiter CORS Security Headers | Reverse Proxy (Nginx Architecture)   |
+-------------------------------------+---------------------------------------+
                                      |
                                      | Internal Routing
                                      v
+-----------------------------------------------------------------------------+
|                             APPLICATION BACKEND                             |
|   Express/NestJS Handlers | Logic Computation Engines | Validation Pipes   |
+-------------------------------------+---------------------------------------+
                                      |
                                      | Type-Safe Connection Pool (Prisma)
                                      v
+-----------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                              |
|   PostgreSQL Engine | Relational Tables | Indexed Date / Household Keys     |
+-----------------------------------------------------------------------------+
```

---

## 4. Key Logical Data Flow Sequences

### 4.1 Periodic Invoice Batch Initialization Flow
Executes the generation of structural financial invoices across all authenticated active household entities.

1. **Trigger:** Administrator issues a `POST` request to `/api/v1/billing/initialize` specifying the targeted `period_month` (e.g., `"2026-06"`).
2. **Validation Block:**
   - Server verifies if invoices for `period_month` already exist to block duplicate mutation.
   - Server queries active households: `SELECT id FROM households WHERE status = 'Active'`.
3. **Execution Engine:**
   - Server fetches all available rows from `bill_types`.
   - Iterates through the active household matrix.
   - For **Flat-Rate** profiles (Waste, Security): Instantiates `bill_records` with `total_amount = rate_per_unit`.
   - For **Variable-Rate** profiles (PDAM): Instantiates `bill_records` with zero values, awaiting manual meter input variables.
4. **Response:** Dispatches HTTP Status `201 Created` with a structural synchronization metadata summary payload.

### 4.2 Utility Metric Update and Automatic Cost Compute Sequence
Governs the entry of variable monthly water consumption numbers.

```
Admin Client                Backend API Engine               PostgreSQL DB
    |                               |                             |
    |--- 1. PUT Meter Data -------->|                             |
    |    (initial, final values)    |                             |
    |                               |--- 2. Validate Delta ------>|
    |                               |      (final >= initial)     |
    |                               |                             |
    |                               |--- 3. Calculate Fee ------->|
    |                               |      (Delta * Rate)         |
    |                               |                             |
    |                               |<-- 4. Persist Record -------|
    |<-- 5. HTTP 200 OK ------------|                             |
```

---

## 5. Directory & Package Module Architecture

The codebase adheres to a highly predictable modular separation structure to maximize maintenance isolation.

```
rt-billing-monorepo/
├── apps/
│   ├── admin-web/ (Frontend SPA)
│   │   ├── src/
│   │   │   ├── components/     # UI Design Atoms, Tables, Fields
│   │   │   ├── hooks/          # Async Data Mutations (TanStack Query)
│   │   │   ├── context/        # Global Layout State Controls
│   │   │   └── pages/          # Layout Routing Blocks
│   │   └── tailwind.config.js  # Token definitions for Clean SaaS aesthetic
│   │
│   └── api-server/ (Backend REST)
│       ├── src/
│       │   ├── controllers/    # Route handler declarations
│       │   ├── services/       # Computational business logic engines
│       │   ├── middlewares/    # Security, Validation, and Auth intercepts
│       │   └── prisma/         # Declarative DB Schema definitions
└── README.md
```

---

## 6. Security Architecture & Structural Constraints

- **Input Inbound Filtering:** Strict type schema enforcement utilizing validation libraries (`Zod` or `class-validator`). Rejects unexpected payload keys.
- **State Mutation Constraints:** Destructive or critical write mutations (`POST`, `PUT`, `DELETE`) require structured authorization handling to eliminate cross-tenant data leaks.
- **Relational Integrity Guarantees:** Database foreign-key constraints cascading are deactivated on core analytical ledger records (`bill_records`) to preserve historical accounting audits if metadata entities change.

---

## 7. Performance & High-Efficiency Tuning Strategies

- **Index Optimization Matrix:** Explicit database indexes are assigned to composite tracking parameters: `CREATE INDEX idx_billing_lookup ON bill_records (household_id, period_month, payment_stat);`
- **Client Render Stability:** Paginated query fetching or virtualized list techniques (`react-virtual`) implemented for rows extending beyond a 100-record threshold to maintain constant frame-rate stability.
