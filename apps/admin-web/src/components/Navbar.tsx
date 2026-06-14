'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/useAuthStore';
import { Button } from './ui';

const TABS = [
  { href: '/', label: 'Dashboard' },
  { href: '/households', label: 'Households' },
  { href: '/invoices', label: 'Invoices & Rates' },
  { href: '/ledger', label: 'Transaction Ledger' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  function logout() {
    clear();
    router.replace('/login');
  }

  return (
    <header className="border-b border-border bg-canvas sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-12">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 bg-brand rounded-sm" aria-hidden />
          <span className="text-sm font-semibold text-text-primary">RT-Billing</span>
        </div>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ' +
                  (active
                    ? 'bg-surface text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface')
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary hidden sm:inline">
            {user?.fullName ?? user?.username}
          </span>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
