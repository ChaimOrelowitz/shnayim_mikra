'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firstName, lastName } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
      }
    }

    setLoading(false);
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-parchment-50 flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c9ae8118 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        <div className="bg-white rounded-2xl shadow-lg border border-parchment-200 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">Check your email</h2>
          <p className="text-ink-500 text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-parchment-50 flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c9ae8118 1px, transparent 0)', backgroundSize: '24px 24px' }}
    >
      {/* Brand header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-hebrew font-bold text-ink-900 mb-1">שניים מקרא</h1>
        <p className="text-ink-400 text-sm tracking-wide">Shnayim Mikra v&apos;Echad Targum Tracker</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-parchment-200 p-8 w-full max-w-sm">
        {/* Tab toggle */}
        <div className="flex rounded-xl bg-parchment-100 p-1 mb-6">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === m
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-ink-600 mb-1.5">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className="w-full border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                  placeholder="Yosef"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-ink-600 mb-1.5">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  className="w-full border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                  placeholder="Cohen"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-parchment-300 rounded-lg px-3 py-2.5 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-lg py-3 text-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#1e3a8a' }}
          >
            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-ink-400 mt-6">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          className="text-ink-700 font-semibold hover:underline"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
