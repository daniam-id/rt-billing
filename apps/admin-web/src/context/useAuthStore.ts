'use client';

import * as React from 'react';
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
}

const STORAGE_KEY = 'rt-billing-auth';

interface PersistedSession {
  token: string;
  user: AuthUser;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user } satisfies PersistedSession));
    }
    set({ token, user });
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ token: null, user: null });
  },
}));

/**
 * Hook used by protected pages and the login page to:
 *  - Read persisted auth from localStorage on first mount.
 *  - Signal when the initial hydration is done via `ready`.
 *
 * Standard `useState + useEffect` pattern; bypasses Zustand subscription
 * quirks that can leave pages stuck on a loading state.
 */
export function useHydratedAuth() {
  const { token, user, setSession, clear } = useAuthStore();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedSession;
        if (parsed?.token && parsed?.user) {
          setSession(parsed.token, parsed.user);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, [setSession]);

  return { ready, token, user, setSession, clear };
}
