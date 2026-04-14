'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language';
import { AliyahCard } from './AliyahCard';
import { markParshaComplete, exitUserMode } from '@/app/actions';
import { hebrewYearLabel } from '@/lib/hebcal';

// Royal progression: deep indigo → navy → royal blue → teal → emerald
const SEFARIM = [
  { nameHe: 'בראשית', nameEn: 'Bereishit', min: 1,  max: 12, color: '#312e81' }, // deep indigo
  { nameHe: 'שמות',   nameEn: 'Shemot',    min: 13, max: 23, color: '#1e3a8a' }, // deep navy
  { nameHe: 'ויקרא',  nameEn: 'Vayikra',   min: 24, max: 33, color: '#1d4ed8' }, // royal blue
  { nameHe: 'במדבר',  nameEn: 'Bamidbar',  min: 34, max: 43, color: '#0e7490' }, // deep teal
  { nameHe: 'דברים',  nameEn: 'Devarim',   min: 44, max: 54, color: '#065f46' }, // deep emerald
];

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative w-[76px] h-[76px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="6" stroke={color} strokeOpacity="0.15" />
        <circle
          cx="38" cy="38" r={r} fill="none" strokeWidth="6"
          stroke={color} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

interface Aliyah {
  id: string;
  number: number;
  done: boolean;
  mikra1: boolean;
  mikra2: boolean;
  targum: boolean;
  pdfPath: string | null;
}

interface Parsha {
  id: string;
  name: string;
  order: number;
  isCurrent?: boolean;
  aliyos: Aliyah[];
}

interface ParshaListProps {
  parshiyos: Parsha[];
  isAdmin?: boolean;
  location?: 'EY' | 'CHUL';
  isViewingAsUser?: boolean;
  hebrewYear: number;
  availableYears: number[];
}

export function ParshaList({
  parshiyos,
  isAdmin,
  location,
  isViewingAsUser,
  hebrewYear,
  availableYears,
}: ParshaListProps) {
  const { lang } = useLanguage();
  const isHe = lang === 'he';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedSefer, setSelectedSefer] = useState<typeof SEFARIM[0] | null>(null);
  const router = useRouter();

  function changeYear(y: number) {
    setSelectedSefer(null);
    router.push(`/?year=${y}`);
  }

  const adminBanner = isViewingAsUser ? (
    <div className="bg-amber-50 border-b border-amber-200 py-2">
      <div className="page-container flex items-center justify-between">
        <span className="text-xs text-amber-700 font-medium">Admin — viewing as user</span>
        <form action={exitUserMode}>
          <button type="submit" className="text-xs text-amber-700 hover:text-amber-900 font-medium">
            ← Back to admin
          </button>
        </form>
      </div>
    </div>
  ) : null;

  // ── Sefer cards view ──────────────────────────────────────────────────────
  if (!selectedSefer) {
    return (
      <div className="min-h-screen bg-parchment-50">
        {adminBanner}
        <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-14 z-10">
          <div className="page-container py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink-900 font-hebrew">שניים מקרא ואחד תרגום</h1>
              <p className="text-ink-400 text-xs mt-0.5">
                {isHe ? 'מעקב שניים מקרא ואחד תרגום' : "Shnayim Mikra v'Echad Targum Tracker"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Admin</span>
              )}
              {location && (
                <span className="text-xs px-2 py-1 bg-parchment-100 rounded-full text-ink-500 font-medium">{location}</span>
              )}
              <select
                value={hebrewYear}
                onChange={(e) => changeYear(parseInt(e.target.value, 10))}
                className="text-xs border border-parchment-300 rounded-full px-2.5 py-1 bg-white text-ink-700 focus:outline-none focus:ring-1 focus:ring-sage-400"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{hebrewYearLabel(y)}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="page-container py-8">
          <div className="flex flex-wrap justify-center gap-4">
            {SEFARIM.map((sefer) => {
              const seferParshiyos = parshiyos.filter(
                (p) => p.order >= sefer.min && p.order <= sefer.max
              );
              const total = seferParshiyos.length;
              const done = seferParshiyos.filter((p) => p.aliyos.every((a) => a.done)).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const hasCurrent = seferParshiyos.some((p) => p.isCurrent);
              const isComplete = pct === 100 && total > 0;

              return (
                <div key={sefer.nameEn} className="w-full sm:w-[47%] lg:w-[30%]">
                <button
                  onClick={() => setSelectedSefer(sefer)}
                  className="relative w-full bg-white rounded-2xl border border-parchment-200 shadow-sm hover:shadow-lg transition-all duration-200 text-start overflow-hidden group"
                >
                  {/* Color banner */}
                  <div className="h-3 w-full" style={{ backgroundColor: sefer.color }} />

                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <ProgressRing pct={pct} color={sefer.color} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-hebrew font-bold text-ink-900 leading-tight">
                            {isHe ? sefer.nameHe : sefer.nameEn}
                          </h2>
                        </div>
                        <p className="text-sm text-ink-400 font-hebrew">
                          {isHe ? sefer.nameEn : sefer.nameHe}
                        </p>
                        <p className="text-xs text-ink-400 mt-2">
                          <span className="font-semibold text-ink-700">{done}</span>
                          <span className="mx-1">/</span>
                          <span>{total}</span>
                          <span className="ml-1">{isHe ? 'פרשיות הושלמו' : 'parshiyos done'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {hasCurrent && (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: sefer.color }}
                        >
                          {isHe ? 'השבוע' : 'This week'}
                        </span>
                      )}
                      {isComplete && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sage-100 text-sage-700 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {isHe ? 'הושלם!' : 'Complete!'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 group-hover:text-ink-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── Parsha list view ──────────────────────────────────────────────────────
  const seferParshiyos = parshiyos.filter(
    (p) => p.order >= selectedSefer.min && p.order <= selectedSefer.max
  );

  return (
    <div className="min-h-screen bg-parchment-50">
      {adminBanner}
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-14 z-10">
        <div className="page-container py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSefer(null)}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-parchment-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              className="w-2 h-7 rounded-full"
              style={{ backgroundColor: selectedSefer.color }}
            />
            <h1 className="text-2xl font-bold text-ink-900 font-hebrew">
              {isHe ? selectedSefer.nameHe : selectedSefer.nameEn}
            </h1>
            <span className="ml-auto text-xs text-ink-400">{hebrewYearLabel(hebrewYear)}</span>
          </div>
        </div>
      </header>

      <main className="page-container py-6">
        <div className="space-y-3">
          {seferParshiyos.map((parsha) => {
            const isOpen = expandedId === parsha.id;
            const doneCount = parsha.aliyos.filter((a) => a.done).length;
            const allDone = doneCount === parsha.aliyos.length && parsha.aliyos.length > 0;

            return (
              <div
                key={parsha.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  parsha.isCurrent
                    ? 'border-2 shadow-md'
                    : 'border-parchment-200 shadow-sm hover:shadow-md'
                }`}
                style={parsha.isCurrent ? { borderColor: selectedSefer.color } : {}}
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : parsha.id)}
                  className="w-full p-4 flex items-center gap-3 text-start"
                >
                  {/* Parsha-complete circle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startTransition(() => markParshaComplete(parsha.id, !allDone, hebrewYear));
                    }}
                    disabled={isPending}
                    title={allDone ? 'Mark incomplete' : 'Mark all done'}
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      allDone
                        ? 'text-white shadow-sm'
                        : 'border-2 border-parchment-300 text-parchment-300 hover:border-sage-500 hover:text-sage-500'
                    }`}
                    style={allDone ? { backgroundColor: selectedSefer.color } : {}}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-semibold font-hebrew ${allDone ? 'text-ink-500' : 'text-ink-900'}`}>
                        {parsha.name}
                      </h3>
                      {parsha.isCurrent && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: selectedSefer.color }}
                        >
                          {isHe ? 'השבוע' : 'This week'}
                        </span>
                      )}
                    </div>

                    {/* Dot chain progress */}
                    <div className="flex items-center mt-1.5">
                      {parsha.aliyos.map((a, i) => (
                        <div key={a.id} className="flex items-center">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                              a.done
                                ? 'border-transparent'
                                : 'bg-white border-parchment-300'
                            }`}
                            style={a.done ? { backgroundColor: selectedSefer.color } : {}}
                          >
                            {a.done && (
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {i < parsha.aliyos.length - 1 && (
                            <div
                              className="h-0.5 w-2.5 transition-colors"
                              style={{ backgroundColor: a.done ? selectedSefer.color : '#e8d9bd' }}
                            />
                          )}
                        </div>
                      ))}
                      <span className="ml-2 text-xs text-ink-400">
                        {doneCount}/{parsha.aliyos.length}
                      </span>
                    </div>
                  </div>

                  <svg
                    className={`w-4 h-4 text-ink-300 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-parchment-100 bg-parchment-50/50 p-3 space-y-2">
                    {parsha.aliyos.map((aliyah) => (
                      <AliyahCard
                        key={aliyah.id}
                        aliyah={aliyah}
                        parshaId={parsha.id}
                        isAdmin={isAdmin}
                        hebrewYear={hebrewYear}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
