import { useMutation } from '@apollo/client';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_MUTATION } from '../graphql/operations';
import { useAuth } from '../lib/useAuth';

type LoginResult = {
  login: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: 'admin' | 'employee';
    };
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@tms.dev');
  const [password, setPassword] = useState('admin123');

  const [doLogin, { loading, error }] = useMutation<LoginResult>(LOGIN_MUTATION);

  const canSubmit = useMemo(() => email.length > 3 && password.length >= 3, [email, password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const res = await doLogin({
      variables: { input: { email, password } },
    });

    const payload = res.data?.login;
    if (!payload) return;

    login({
      accessToken: payload.accessToken,
      user: payload.user,
    });

    navigate('/shipments');
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/25">
            <svg
              className="h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <h1 className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
            Transportation Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your shipments</p>
        </div>

        <div className="card p-6">
          <div className="mb-6 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-sky-400">
              Demo Credentials
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-xs">🛡️</span>
                  Admin
                </span>
                <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  admin@tms.dev / admin123
                </code>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-500/20 text-xs">👤</span>
                  Employee
                </span>
                <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  employee@tms.dev / employee123
                </code>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <div className="mb-1.5 text-sm font-medium text-slate-300">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 text-sm font-medium text-slate-300">Password</div>
              <input
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error.message}
              </div>
            ) : null}

            <button type="submit" disabled={!canSubmit || loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
