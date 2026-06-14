'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}
