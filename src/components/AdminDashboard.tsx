'use client';

import { useState, useTransition } from 'react';
import { signOut, setUserRole, deleteUser, setViewAsUser } from '@/app/actions';
import type { CalendarEntry } from '@/lib/hebcal';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  _count: { aliyahProgress: number };
}

interface Aliyah {
  id: string;
  number: number;
  pdfPath: string | null;
}

interface Parsha {
  id: string;
  name: string;
  englishName: string | null;
  order: number;
  aliyos: Aliyah[];
}

interface AdminDashboardProps {
  currentUser: { id: string; email: string };
  users: User[];
  totalAliyos: number;
  totalParshiyos: number;
  parshiyosWithPdfs: Parsha[];
  calendar: CalendarEntry[];
}

const SEFARIM = [
  { name: 'Bereishit', min: 1,  max: 12.9 },
  { name: 'Shemot',   min: 13, max: 23.9 },
  { name: 'Vayikra',  min: 24, max: 33.9 },
  { name: 'Bamidbar', min: 34, max: 43.9 },
  { name: 'Devarim',  min: 44, max: 54.9 },
];

type Tab = 'users' | 'pdfs' | 'calendar';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' });
}

export function AdminDashboard({ currentUser, users, totalAliyos, totalParshiyos, parshiyosWithPdfs, calendar }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('users');
  const [isPending, startTransition] = useTransition();

  const totalPdfs = parshiyosWithPdfs.reduce((sum, p) => sum + p.aliyos.filter(a => a.pdfPath).length, 0);
  const totalAliyosCount = parshiyosWithPdfs.reduce((sum, p) => sum + p.aliyos.length, 0);

  const today = new Date().toISOString().slice(0, 10);
  // Find the index of the first upcoming entry (on or after today)
  const currentWeekIdx = calendar.findIndex(e => e.date >= today);

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Admin</h1>
            <p className="text-sm text-ink-400">{currentUser.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <form action={setViewAsUser.bind(null, true)}>
              <button
                type="submit"
                className="text-xs text-sage-600 hover:text-sage-700 font-medium transition-colors"
              >
                View as user →
              </button>
            </form>
            <a href="/settings" className="text-xs text-ink-400 hover:text-ink-700 transition-colors">
              Settings
            </a>
            <form action={signOut}>
              <button type="submit" className="text-xs text-ink-400 hover:text-ink-700 transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Tabs */}
        <div className="page-container flex gap-6 border-t border-parchment-200">
          {(['users', 'pdfs', 'calendar'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-ink-900 text-ink-900'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {t === 'users'    ? `Users (${users.length})` :
               t === 'pdfs'     ? `PDFs (${totalPdfs}/${totalAliyosCount})` :
               'Calendar'}
            </button>
          ))}
          <a
            href="/admin/upload"
            className="ml-auto py-3 text-sm font-medium text-sage-600 hover:text-sage-700 flex items-center gap-1"
          >
            Bulk Upload ↗
          </a>
        </div>
      </header>

      <main className="page-container py-8">
        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-parchment-50 border-b border-parchment-200">
                <tr>
                  <th className="text-left px-4 py-3 text-ink-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-ink-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-ink-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-ink-500 font-medium">Aliyos done</th>
                  <th className="text-left px-4 py-3 text-ink-500 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-parchment-50">
                    <td className="px-4 py-3 text-ink-800 font-medium">
                      {u.firstName || u.lastName
                        ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                        : <span className="text-ink-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {u._count.aliyahProgress} / {totalAliyos}
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== currentUser.id && (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            disabled={isPending}
                            onClick={() => startTransition(() =>
                              setUserRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')
                            )}
                            className="text-xs text-ink-400 hover:text-ink-700 transition-colors"
                          >
                            Make {u.role === 'ADMIN' ? 'User' : 'Admin'}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => {
                              if (confirm(`Remove ${u.email}?`)) {
                                startTransition(() => deleteUser(u.id));
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-400">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PDFs tab ── */}
        {tab === 'pdfs' && (
          <div className="space-y-6">
            {SEFARIM.map(sefer => {
              const seferParshiyos = parshiyosWithPdfs.filter(p => p.order >= sefer.min && p.order <= sefer.max);
              return (
                <div key={sefer.name} className="card overflow-hidden">
                  <div className="bg-parchment-100 border-b border-parchment-200 px-4 py-3">
                    <h2 className="font-semibold text-ink-800">{sefer.name}</h2>
                  </div>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-parchment-100">
                      {seferParshiyos.map(p => {
                        const hasPdfs = p.aliyos.filter(a => a.pdfPath).length;
                        return (
                          <tr key={p.id} className="hover:bg-parchment-50">
                            <td className="px-4 py-2.5 font-hebrew text-ink-800 w-48">
                              <span className={!Number.isInteger(p.order) ? 'text-amber-700' : ''}>
                                {p.englishName}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1.5 flex-wrap">
                                {p.aliyos.map(a => (
                                  <span
                                    key={a.id}
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                      a.pdfPath ? 'bg-sage-100 text-sage-700' : 'bg-parchment-200 text-ink-400'
                                    }`}
                                  >
                                    {a.number}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-ink-400 text-xs text-right">
                              {hasPdfs}/{p.aliyos.length}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Calendar tab ── */}
        {tab === 'calendar' && (
          <div className="card overflow-hidden">
            <div className="bg-parchment-100 border-b border-parchment-200 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-800">Upcoming parshiyos</h2>
              <p className="text-xs text-ink-400">Source: Hebcal API</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-parchment-50 border-b border-parchment-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-ink-500 font-medium w-44">Shabbat</th>
                    <th className="text-left px-4 py-3 text-ink-500 font-medium">Chutz LaAretz</th>
                    <th className="text-left px-4 py-3 text-ink-500 font-medium">Eretz Yisrael</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-100">
                  {calendar.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-ink-400">
                        Could not load calendar — check network
                      </td>
                    </tr>
                  )}
                  {calendar.map((entry, i) => {
                    const isCurrent = i === currentWeekIdx;
                    const differs = entry.chul !== entry.ey && entry.chul && entry.ey;
                    return (
                      <tr
                        key={entry.date}
                        className={`${isCurrent ? 'bg-sage-50' : 'hover:bg-parchment-50'}`}
                      >
                        <td className={`px-4 py-2.5 text-xs ${isCurrent ? 'font-semibold text-sage-800' : 'text-ink-400'}`}>
                          {formatDate(entry.date)}
                          {isCurrent && <span className="ml-1.5 text-sage-600">(this week)</span>}
                        </td>
                        <td className={`px-4 py-2.5 ${differs ? 'font-medium text-amber-700' : 'text-ink-800'}`}>
                          {entry.chul ?? <span className="text-ink-300">—</span>}
                        </td>
                        <td className={`px-4 py-2.5 ${differs ? 'font-medium text-amber-700' : 'text-ink-800'}`}>
                          {entry.ey ?? <span className="text-ink-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
