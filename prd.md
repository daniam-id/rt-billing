# Product Requirement Document (PRD)

## 1. Document Control
- **Project Name:** RT-Billing Admin Dashboard (Neighborhood Routine Invoicing Application)
- **Version:** 1.0.0
- **Date:** June 14, 2026
- **Author:** Adam Dani Apta Mahendra
- **Status:** Draft
- **Target Release:** Q3 2026

---

## 2. Executive Summary & Objective
### 2.1 Problem Statement
Neighborhood administrative units (RT - Rukun Tetangga) in Indonesia face recurring logistical challenges in managing monthly community fees (Iuran Komunal). Common issues include manual tracking of utility metrics (such as PDAM water usage), unorganized collection of fixed fees (waste management, security), lack of transparency in financial arrears, and highly manual data entry using paper or basic spreadsheets that are prone to errors and loss.

### 2.2 Product Vision
To build a high-fidelity, high-efficiency, Minimal Viable Product (MVP) admin-centric platform. The interface must adopt a modern, functional, minimalist "Clean SaaS" aesthetic—emphasizing rapid technical entry, automated calculation workflows, data density without clutter, and absolute structural clarity for the RT administrator.

### 2.3 Scope of MVP
- **Phase 1 (In Scope):** Fully-featured Admin Dashboard. Includes residential identity management, multi-tier utility/fixed billing engines, manual receipt logging, and a comprehensive real-time financial tracking dashboard.
- **Phase 2 (Out of Scope for MVP):** Public resident application portal, automated payment gateway integration (Xendit/Midtrans), and automated WhatsApp messaging cron-jobs.

---

## 3. User Personas & User Stories
### 3.1 Target Persona
- **Primary User:** RT Administrator / Treasurer.
- **Attributes:** High digital literacy or assisted digital competency; requires data accuracy, fast entry mechanisms (keyboard-driven flows), and clear visual progress tracking.

### 3.2 User Stories
| ID | As a/an... | I want to... | So that I can... |
| :--- | :--- | :--- | :--- |
| **US-01** | RT Administrator | Configure flat-rate monthly fees (e.g., Waste, Security) | Apply standardized pricing across all active households instantly. |
| **US-02** | RT Administrator | Input initial and final PDAM meter numbers per household | Let the system calculate variable charges automatically based on usage rates. |
| **US-03** | RT Administrator | View a unified collection overview (Paid vs. Arrears) | Understand the current monthly financial health of the RT at a glance. |
| **US-04** | RT Administrator | Filter household records by payment status (Paid, Pending, Overdue) | Identify non-compliant households and execute directed manual collection efforts. |
| **US-05** | RT Administrator | Manually toggle payment status and log payment timestamps | Update records instantly when a resident pays via cash or manual bank transfer. |

---

## 4. Architectural Information & Technical Specifications

### 4.1 System Architecture Diagram (Conceptual Layout)
The web application follows a standard decoupled or monorepo single-page application (SPA) architecture optimized for client-side manipulation of tabular data.

```
+-----------------------------------------------------------------+
|                         Frontend UI                             |
|    (React.js / Next.js SPA Engine + Tailwind CSS Design System)  |
+--------------------------------+--------------------------------+
                                 |
                                 | RESTful API / JSON Transactions
                                 v
+-----------------------------------------------------------------+
|                         Backend Core                            |
|             (Node.js REST Service / API Gateway)                |
+--------------------------------+--------------------------------+
                                 |
                                 | Object Relational Mapping (ORM)
                                 v
+-----------------------------------------------------------------+
|                        Database Layer                           |
|                 (Relational Engine: PostgreSQL)                 |
+-----------------------------------------------------------------+
```

### 4.2 Database Schema (Entity-Relationship Blueprint)

```
                       +-------------------+
                       |    HOUSEHOLDS     |
                       +-------------------+
                       | PK | id           |
                       |    | house_number |
                       |    | head_of_name |
                       |    | status       | <--- (Active, Vacant)
                       +----------+--------+
                                  |
                                  | 1
                                  |
                                  | N
                       +----------v--------+
                       |   BILL_RECORDS    |
                       +-------------------+
                       | PK | id           |
                       | FK | household_id |
                       | FK | bill_type_id |
                       |    | period_month | <--- (YYYY-MM format)
                       |    | initial_meter| <--- (Nullable, for PDAM)
                       |    | final_meter  | <--- (Nullable, for PDAM)
                       |    | total_amount |
                       |    | payment_stat | <--- (Paid, Pending, Overdue)
                       |    | paid_at      | <--- (Timestamp)
                       +----------+--------+
                                  |
                                  | N
                                  |
                                  | 1
                       +----------v--------+
                       |    BILL_TYPES     |
                       +-------------------+
                       | PK | id           |
                       |    | name         | <--- (PDAM, Waste, Security)
                       |    | charge_type  | <--- (Flat, Variable)
                       |    | rate_per_unit| <--- (Base flat price or per-m3)
                       +-------------------+
```

---

## 5. Functional Requirements & Core Features

### 5.1 Analytics & High-Level Metric KPIs
- **System Action:** The interface must aggregate operational states across the active system variables for the selected `period_month`.
- **Data Points:**
  - **Total Billed Amount:** `SUM(total_amount)` across all generated bills for the target month.
  - **Collected Revenue:** `SUM(total_amount) WHERE payment_stat = 'Paid'`.
  - **Total Arrears:** `SUM(total_amount) WHERE payment_stat = 'Overdue'`.
  - **Collection Rate:** `(Collected Revenue / Total Billed Amount) * 100` represented as a percentage indicator.

### 5.2 Household Management Subsystem (Household CRM)
- **Data Validation Framework:**
  - `house_number`: Unique alphanumeric string. Required.
  - `head_of_name`: Text string, sanitized against special characters. Required.
  - `status`: Structural Enum `[Active, Vacant]`.
- **Administrative Mutators:** Full Create, Read, Update, Delete (CRUD) support with an inline modal confirmation pattern to prevent accidental data erasure.

### 5.3 Billing & Invoicing Compute Core
- **Flat-Rate Model Framework:** Calculates invoice as `total_amount = rate_per_unit`.
- **Variable-Rate Model Framework (PDAM Utility Engine):**
  - **Formula Constraint:** If `final_meter < initial_meter`, trigger validation block: `"Final usage metric cannot be less than initial metric"`.
  - **Calculation Execution:** `total_amount = (final_meter - initial_meter) * rate_per_unit`.
- **Batch Ledger Initialization:** Admin selects a target `period_month` and executes global bill generation, auto-instantiating billing objects for all `Active` records within the Database.

### 5.4 Unified Transaction Matrix (Tabel Log Transaksi)
- **Filtering Requirements:** Real-time multi-select parameters allowing intersection filtering across `bill_type_id`, `payment_stat`, and `house_number`.
- **Direct Mutator Action:** Provide an immediate visual confirmation mechanism (click-to-toggle toggle or button) allowing the administrator to mutate `payment_stat` status from `Pending`/`Overdue` to `Paid` instantly upon physical validation of payment.

---

## 6. UI/UX Design Directives (Clean SaaS Paradigm)

### 6.1 Design Token Architecture
- **Primary Background Canvas:** Absolute or near-absolute white (`#FFFFFF`) or Slate Light Tint (`#F8FAFC`).
- **Surface Containment Components:** Bordered bounding frames using a crisp, muted divider boundary tint (`#E2E8F0`). Do not use drop-shadows or unaligned borders.
- **Primary Accents & State Signifiers:**
  - **Brand Accent / Call-To-Action:** Deep Technical Sapphire Blue (`#0F172A` or `#2563EB`).
  - **Success Token (Paid Status):** Desaturated Emerald Leaf Green (`#10B981` / Background Fill: `#EF1259` -> `#ECFDF5`).
  - **Destructive/Overdue Alert Token:** Desaturated Crimson Red (`#EF4444` / Background Fill: `#FEF2F2`).
- **Typography Matrix:** Pure High-Legibility Sans-Serif system fonts (`Inter`, `system-ui`).

### 6.2 Structural Mockup Layout & Component Wireframes

```
+---------------------------------------------------------------------------------------------------------+
|  RT-BILLING ADMIN   [ Dashboard ]   [ Households ]   [ Invoices & Rates ]   [ Transaction Ledger ]      |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  MONTHLY OVERVIEW: JUNE 2026                                                                            |
|  +----------------------+  +----------------------+  +----------------------+  +---------------------+  |
|  | TOTAL BILLED         |  | COLLECTED REVENUE    |  | TOTAL ARREARS        |  | COLLECTION RATE     |  |
|  | Rp 12.500.000        |  | Rp 9.375.000         |  | Rp 3.125.000         |  | 75.0%               |  |
|  +----------------------+  +----------------------+  +----------------------+  +---------------------+  |
|                                                                                                         |
|  TRANSACTION REAL-TIME MATRIX                                                                           |
|  [ Search House... ]   Filter Status: [ All v ]  Filter Type: [ All v ]            [+ Manual Log]       |
|  +--------------+-------------------+---------------+-----------------+---------------+---------------+  |
|  | House No.    | Head of Family    | Bill Type     | Bill Amount     | Status        | Action        |  |
|  +--------------+-------------------+---------------+-----------------+---------------+---------------+  |
|  | A-01         | Budi Santoso      | PDAM Utility  | Rp 175.000      | [ LUNAS ]     | [ View Link ] |  |
|  | A-02         | Ahmad Rifai       | Waste Mgmt    | Rp 50.000       | [ MENUNGGAK ] | [ Mark Paid ] |  |
|  | A-03         | Siti Aminah       | Security Fee  | Rp 75.000       | [ LUNAS ]     | [ View Link ] |  |
|  +--------------+-------------------+---------------+-----------------+---------------+---------------+  |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 7. Non-Functional Requirements & Performance Metrics

### 7.1 System Availability & Network Processing Goals
- **Network Performance Constraint:** Under standardized 4G or fixed residential connections, the analytical tracking components and matrix rendering must complete loading cycles under **1.5 seconds** (Time to Interactive - TTI).
- **Client Render Stability:** The data tables must perform smoothly without lag or layout shifting during manual entry, even when handling records for up to 500 active households simultaneously.

### 7.2 Security Protocols
- **State Partitioning:** Ensure all administrative actions require explicit authentication. Prevent any unauthorized access to data mutations.
- **Input Content Sanitization:** Force sanitization on all inbound string parameters across text areas to neutralize cross-site scripting (XSS) vectors or standard SQL Injection attempts.

---

## 8. Development Milestones & Success Criteria
- **Milestone 1 (Database & API Framework):** Schema implementation, test fixtures verification, and functional query testing complete.
- **Milestone 2 (Core Utility Calculation Matrix):** Variable PDAM calculations and invoice generation engine validated without logic errors.
- **Milestone 3 (UI Layout & Integration):** Completion of the frontend layout according to the Clean SaaS visual specification tokens.
- **Success Criteria:** The system must accurately compute complex calculations, update payment states instantly upon admin input, and maintain a fast, intuitive, uncluttered user experience throughout the workflow.
