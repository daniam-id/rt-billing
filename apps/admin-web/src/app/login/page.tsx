'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/axios';
import { useHydratedAuth, AuthUser } from '@/context/useAuthStore';

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export default function LoginPage() {
  const router = useRouter();
  const { ready, token, setSession } = useHydratedAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && token) router.replace('/dashboard');
  }, [ready, token, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ ok: true; data: LoginResponse }>('/api/v1/auth/login', {
        username,
        password,
      });
      setSession(res.data.data.token, res.data.data.user);
      router.replace('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface text-sm text-text-muted">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-canvas border border-border rounded-md p-6"
      >
        <h1 className="text-lg font-semibold mb-1 text-text-primary">RT-Billing Admin</h1>
        <p className="text-sm text-text-secondary mb-6">Sign in to manage neighborhood billing</p>

        <label className="block text-xs font-medium text-text-secondary mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md mb-4 bg-canvas focus:outline-none focus:border-brand"
          autoComplete="username"
          required
        />

        <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md mb-2 bg-canvas focus:outline-none focus:border-brand"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-xs text-danger mb-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-xs text-text-muted mt-4">
          Default: <code className="font-mono">admin</code> / <code className="font-mono">admin123</code>
        </p>
      </form>
    </main>
  );
}
