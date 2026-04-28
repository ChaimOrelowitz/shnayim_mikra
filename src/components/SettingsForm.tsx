'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions';

interface Profile {
  firstName: string | null;
  lastName: string | null;
  email: string;
  location: 'EY' | 'CHUL';
  role: 'ADMIN' | 'USER';
  preferredView: 'CLASSIC' | 'READER';
}

export function SettingsForm({ profile, backHref }: { profile: Profile; backHref: string }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [location, setLocation] = useState<'EY' | 'CHUL'>(profile.location);
  const [preferredView, setPreferredView] = useState<'CLASSIC' | 'READER'>(profile.preferredView);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), location, ...(profile.role === 'ADMIN' && { preferredView }) });
      setSaved(true);
    });
  }

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container py-4 flex items-center gap-3">
          <a href={backHref} className="text-ink-400 hover:text-ink-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-ink-900">Settings</h1>
        </div>
      </header>

      <main className="page-container py-8 max-w-md">
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <p className="text-xs text-ink-400 mb-4">{profile.email}</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-700 mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-300 bg-white"
                placeholder="Yosef"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-700 mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-300 bg-white"
                placeholder="Cohen"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Location</label>
            <p className="text-xs text-ink-400 mb-3">
              This affects which parsha is shown as current each week — EY (Eretz Yisrael) and Chul (Diaspora) sometimes read different parshiyos.
            </p>
            <div className="flex gap-3">
              {(['CHUL', 'EY'] as const).map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    location === loc
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white text-ink-700 border-parchment-300 hover:border-ink-400'
                  }`}
                >
                  {loc === 'CHUL' ? 'Chutz LaAretz' : 'Eretz Yisrael'}
                </button>
              ))}
            </div>
          </div>

          {profile.role === 'ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Reader view</label>
              <p className="text-xs text-ink-400 mb-3">
                Classic view shows the PDF. Reader view is an experimental scroll-based reader with Rashi.
              </p>
              <div className="flex gap-3">
                {(['CLASSIC', 'READER'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreferredView(mode)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      preferredView === mode
                        ? 'bg-ink-900 text-white border-ink-900'
                        : 'bg-white text-ink-700 border-parchment-300 hover:border-ink-400'
                    }`}
                  >
                    {mode === 'CLASSIC' ? 'Classic (PDF)' : 'Reader (Beta)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="bg-stone-800 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            {saved && (
              <span className="text-sm text-sage-600">Saved!</span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
