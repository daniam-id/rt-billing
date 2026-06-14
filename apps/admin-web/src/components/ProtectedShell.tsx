'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydratedAuth } from '@/context/useAuthStore';
import { Navbar } from './Navbar';

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, token } = useHydratedAuth();

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
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
