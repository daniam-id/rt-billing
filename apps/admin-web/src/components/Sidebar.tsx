'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/context/useAuthStore';
import { Button } from './ui';

const TABS = [
  { href: '/', label: 'Dashboard' },
  { href: '/households', label: 'Households' },
  { href: '/invoices', label: 'Invoices & Rates' },
  { href: '/ledger', label: 'Transaction Ledger' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [mobileOpen, onClose]);

  function logout() {
    clear();
    router.replace('/login');
  }

  const sidebarContent = (
    <aside className="h-screen w-64 flex flex-col bg-canvas border-r border-border">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-6 h-6 bg-brand rounded-sm" aria-hidden />
        <span className="text-sm font-semibold text-text-primary">RT-Billing</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        <ul className="space-y-0.5">
          {TABS.map((t) => {
            const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ' +
                    (active
                      ? 'bg-blue-50 text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface')
                  }
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand rounded-r-sm"
                      aria-hidden
                    />
                  )}
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">
            {user?.fullName ?? user?.username ?? 'User'}
          </p>
          <p className="text-[11px] text-text-muted truncate">{user?.role ?? ''}</p>
        </div>
        <Button variant="secondary" onClick={logout} className="text-xs px-2 py-1">
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex shrink-0">{sidebarContent}</div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            className="flex-1 bg-black/30 cursor-default"
            aria-label="Close menu"
            onClick={onClose}
          />
          <div className="relative">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
