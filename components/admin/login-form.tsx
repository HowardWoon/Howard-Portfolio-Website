'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="muted-label mb-3">Admin access</p>
        <h1 className="text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-3 text-sm leading-7 text-fog-500">Use your Supabase Auth credentials to manage experiences, projects, and skills.</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="floating-field">
          <input
            id="admin-email"
            className="floating-input"
            placeholder=" "
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="admin-email" className="floating-label">
            Email
          </label>
        </div>

        <div className="floating-field">
          <input
            id="admin-password"
            className="floating-input"
            placeholder=" "
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <label htmlFor="admin-password" className="floating-label">
            Password
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="pill-button pill-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" />
        <span>{loading ? 'Signing in...' : 'Enter Dashboard'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
