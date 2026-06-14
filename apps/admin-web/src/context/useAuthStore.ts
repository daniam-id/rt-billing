'use client';

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
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
  hydrateFromStorage: () => void;
}

const STORAGE_KEY = 'rt-billing-auth';

interface PersistedSession {
  token: string;
  user: AuthUser;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
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
  hydrateFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hydrated: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as PersistedSession;
      set({ token: parsed.token, user: parsed.user, hydrated: true });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      set({ hydrated: true });
    }
  },
}));
