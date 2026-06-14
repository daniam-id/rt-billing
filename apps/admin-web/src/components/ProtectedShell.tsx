'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHydratedAuth } from '@/context/useAuthStore';
import { Sidebar } from './Sidebar';

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, token } = useHydratedAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !token) router.replace('/login');
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-text-muted">
        Loading session…
      </div>
    );
  }
  if (!token) return null;

  return (
    <div className="h-screen bg-canvas flex overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-2 h-12 px-4 bg-canvas border-b border-border">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-text-secondary hover:text-text-primary p-1 -ml-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary">RT-Billing</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
