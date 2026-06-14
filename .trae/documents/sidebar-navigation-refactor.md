# Sidebar Navigation Refactor

Replace the top `Navbar` (sticky horizontal header) with a fixed left `Sidebar` and a scrollable main content area. Preserve all routing, state, and page logic.

## Summary

- Delete `apps/admin-web/src/components/Navbar.tsx` (no other consumers — verified via Grep).
- Create a new `Sidebar` component that owns branding, nav links, and user/logout.
- Restructure `ProtectedShell` into a `flex h-screen` shell: `Sidebar` on the left, scrollable `<main>` on the right.
- Mobile (< `md`): sidebar is hidden; a sticky top bar inside `<main>` exposes a hamburger that opens a slide-out sheet with a backdrop.
- Keep the existing `max-w-7xl mx-auto px-4 py-6` content wrapper inside `<main>` so page content width/visual rhythm is unchanged.

## Current State Analysis

- `apps/admin-web/src/app/(app)/layout.tsx` wraps children in `<ProtectedShell>`.
- `apps/admin-web/src/components/ProtectedShell.tsx` (lines 25–30) renders `<Navbar />` above `<main className="max-w-7xl mx-auto px-4 py-6">`.
- `apps/admin-web/src/components/Navbar.tsx` defines the tabs (Dashboard, Households, Invoices & Rates, Transaction Ledger), brand block, user info, and Logout. Used only by `ProtectedShell`.
- Design tokens already match the spec — no new colors needed:
  - `canvas: '#FFFFFF'`, `surface: '#F8FAFC'`, `border: '#E2E8F0'` (Tailwind config at `apps/admin-web/tailwind.config.ts:11–19`)
  - `brand: '#2563EB'` (used for the active indicator bar)
  - Inter font via `--font-inter` (root layout)
  - "No shadows" rule already in effect
- `apps/admin-web/src/components/ui/index.tsx` already exports `Button` (variants: `primary | secondary | danger | ghost`) — reuse `variant="secondary"` for Logout.
- Auth state and `useHydratedAuth` are in `apps/admin-web/src/context/useAuthStore.ts` — no changes needed.

## Proposed Changes

### 1. CREATE `apps/admin-web/src/components/Sidebar.tsx`

A new client component that renders the vertical navigation.

**Why:** Encapsulate all sidebar concerns (links, active state, branding, user/logout, mobile sheet) in one isolated, testable component. Cleanly replaces `Navbar` and gives the project a single owner for the navigation surface.

**How (structural outline):**

- `'use client'`. Imports: `Link` from `next/link`, `usePathname`/`useRouter` from `next/navigation`, `useEffect`/`useState` from `react`, `useAuthStore` from `@/context/useAuthStore`, `Button` from `./ui`.
- Move the `TABS` array (Dashboard, Households, Invoices & Rates, Transaction Ledger) here from `Navbar.tsx`.
- Props: `{ mobileOpen: boolean; onClose: () => void }`.
- Extract a `sidebarContent` local: `<aside className="h-screen w-64 flex flex-col bg-canvas border-r border-border">` containing three stacked regions:
  1. **Branding zone** — `h-14 flex items-center gap-2 px-4 border-b border-border`. The existing 6×6 brand square (`bg-brand rounded-sm`) and `text-sm font-semibold` "RT-Billing" label.
  2. **Nav** — `flex-1 overflow-y-auto px-2 py-3` with a `<ul className="space-y-0.5">`. Each `<li>` wraps a `<Link>`:
     - Base: `relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`.
     - Inactive: `text-text-secondary hover:text-text-primary hover:bg-surface`.
     - Active: `bg-blue-50 text-text-primary font-semibold` + a positioned `<span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand rounded-r-sm" aria-hidden />` left indicator bar.
     - `aria-current="page"` on active link for a11y.
     - Active match: same rule used by `Navbar` (`t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)`).
  3. **User + Logout** — `border-t border-border px-3 py-3 flex items-center justify-between gap-2`. Left side: `text-xs font-medium text-text-primary truncate` for `user?.fullName ?? user?.username` and `text-[11px] text-text-muted truncate` for `user?.role`. Right side: `<Button variant="secondary" className="text-xs px-2 py-1" onClick={logout}>Logout</Button>`.
- `logout()` calls `clear()` then `router.replace('/login')` — identical to current behavior.
- `useEffect` watching `pathname`: call `onClose()` so the mobile sheet auto-closes on navigation.
- Render strategy:
  - Always render the desktop rail: `<div className="hidden md:flex shrink-0">{sidebarContent}</div>`.
  - When `mobileOpen`, additionally render an overlay: `<div className="md:hidden fixed inset-0 z-40 flex">` containing a backdrop button (`flex-1 bg-black/30`, `aria-label="Close menu"`) on the left and `{sidebarContent}` on the right.
- Add an Esc-to-close effect (`document.addEventListener('keydown', …)`), mirroring the pattern in `apps/admin-web/src/components/ui/Modal.tsx:14–22`.
- No emojis. No drop shadows. No purple/violet colors.

### 2. MODIFY `apps/admin-web/src/components/ProtectedShell.tsx`

Replace the header + main structure with the new flex shell.

**Why:** This is the only layout that renders the navbar; restructuring it here cascades to every page under `app/(app)/`.

**How (diffs):**

- Remove `import { Navbar } from './Navbar';`.
- Add `import { useState } from 'react';` (already imports `useEffect`).
- Add `import { Sidebar } from './Sidebar';`.
- Add `const [mobileOpen, setMobileOpen] = useState(false);` after the existing `useRouter`/`useHydratedAuth` lines.
- Replace the return JSX (current lines 25–30) with:
  ```tsx
  <div className="h-screen bg-canvas flex overflow-hidden">
    <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <main className="flex-1 h-screen overflow-y-auto">
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-2 h-12 px-4 bg-canvas border-b border-border">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-text-secondary hover:text-text-primary p-1 -ml-1"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-text-primary">RT-Billing</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </main>
  </div>
  ```
- The mobile top bar is `md:hidden` so it does not appear on desktop; the desktop sidebar (`hidden md:flex`) hides on mobile. The hamburger button is the only mobile entry point.
- Keep the existing loading and unauthenticated branches (lines 16–23) untouched.
- z-index: sidebar overlay at `z-40`, mobile top bar at `z-30`, both below the `z-50` used by `Modal`.

### 3. DELETE `apps/admin-web/src/components/Navbar.tsx`

**Why:** No remaining consumers; `ProtectedShell` now imports `Sidebar` instead. Removing the file prevents dead-code drift and avoids confusion between two nav implementations.

### 4. NO CHANGES to `apps/admin-web/src/app/(app)/layout.tsx`

It already delegates entirely to `ProtectedShell`, which is the single point of change for the layout.

### 5. NO CHANGES to page components

`app/(app)/page.tsx`, `households/page.tsx`, `invoices/page.tsx`, `ledger/page.tsx` all render self-contained `<div className="space-y-4">` blocks. They will be visually unaffected — they just sit inside a different parent container. Auth, TanStack Query, and Zustand flows are unchanged.

### 6. Update `PROGRESS.md`

Per `AGENTS.md` ("MUST update PROGRESS.md before commits"), append a short entry summarizing the layout refactor and the files touched. This is the only `.md` file the executor should touch in this task.

## Assumptions & Decisions

- **Active state style:** `bg-blue-50` tint + semibold label + 3px brand-blue left bar. Confirmed by user.
- **User/Logout placement:** bottom of sidebar with a `border-t` separator. Confirmed by user.
- **Mobile UX:** slide-out sheet with backdrop, hamburger in a sticky top bar inside the scrollable content area. Confirmed by user.
- **Sidebar width:** `w-64` (256px) as suggested by the spec.
- **Brand indicator color:** `bg-brand` (`#2563EB`) — uses the existing token, no new palette additions.
- **Backdrop color:** `bg-black/30` — consistent with `Modal.tsx:26` pattern.
- **Esc + body scroll lock:** the Esc handler mirrors `Modal.tsx`. Body scroll lock is unnecessary because `<main class="overflow-y-auto">` is the only scrollable surface; the parent shell has `overflow-hidden` so the page underneath never moves when the sheet is open.
- **No new dependencies.** All UI primitives (`Button`) and utilities (clsx via `ui/index.tsx`) already exist. No icon library added; the hamburger uses a hand-rolled inline SVG (the same lightweight approach used elsewhere in the codebase).
- **No redesign of page content.** Page headers, tables, and forms stay as they are.

## Verification Steps

1. **Type check** — `npm -w @rt-billing/admin-web exec tsc --noEmit` (per `AGENTS.md` quick commands). Must pass with no errors.
2. **Dev server** — `npm -w @rt-billing/admin-web run dev` and load `http://localhost:3000`. Confirm:
   - No top header is visible; sidebar appears on the left.
   - Page content scrolls within `<main>` and the sidebar stays fixed.
   - Clicking each nav link highlights it (active style + left bar) and the URL updates.
   - The four tabs in `TABS` all render: Dashboard (`/`), Households, Invoices & Rates, Transaction Ledger.
   - User name + role + Logout render at the bottom of the sidebar; Logout clears the session and routes to `/login`.
3. **Mobile check** — resize the browser to < 768px wide (or use DevTools device emulation). Confirm:
   - Sidebar is hidden.
   - Hamburger appears in the sticky top bar of the content area.
   - Tapping the hamburger opens the sidebar with a backdrop; tapping the backdrop or any link closes it.
   - Esc closes the sheet.
4. **Login page** — `http://localhost:3000/login` is unaffected: no sidebar, no top bar, login form is centered on `bg-surface`.
5. **Logout loop** — sign out, confirm redirect to `/login`, sign in again, confirm sidebar reappears with correct user info.
6. **Lint / build** — `npm -w @rt-billing/admin-web run build` to catch any production-only issues.
7. **Manual visual check against the spec**:
   - Background `#FFFFFF` or `#F8FAFC` ✅
   - `border-r border-[#E2E8F0]` (equivalent: `border-r border-border`) ✅
   - No drop shadows ✅
   - Inter font, vertical stacked nav ✅
   - Active state: desaturated bg tint + bold weight + left indicator bar ✅
   - Hover: lighter text transition, no high-saturation flash ✅
   - No purple/violet colors ✅

## Files Touched

| Action | Path |
|--------|------|
| Create | `apps/admin-web/src/components/Sidebar.tsx` |
| Modify | `apps/admin-web/src/components/ProtectedShell.tsx` |
| Delete | `apps/admin-web/src/components/Navbar.tsx` |
| Modify | `PROGRESS.md` (append refactor note) |
