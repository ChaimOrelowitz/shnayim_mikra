'use client';

import { useState, useTransition } from 'react';
import { useLanguage } from '@/lib/language';
import { AliyahCard } from './AliyahCard';
import { markParshaComplete } from '@/app/actions';

const SEFARIM: { nameHe: string; nameEn: string; min: number; max: number }[] = [
  { nameHe: 'בראשית', nameEn: 'Bereishit', min: 1,  max: 12 },
  { nameHe: 'שמות',   nameEn: 'Shemot',    min: 13, max: 23 },
  { nameHe: 'ויקרא',  nameEn: 'Vayikra',   min: 24, max: 33 },
  { nameHe: 'במדבר',  nameEn: 'Bamidbar',  min: 34, max: 43 },
  { nameHe: 'דברים',  nameEn: 'Devarim',   min: 44, max: 54 },
];

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
  aliyos: Aliyah[];
}

interface ParshaListProps {
  parshiyos: Parsha[];
}

export function ParshaList({ parshiyos }: ParshaListProps) {
  const { lang } = useLanguage();
  const isHe = lang === 'he';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedSefer, setSelectedSefer] = useState<typeof SEFARIM[0] | null>(null);

  // ── Sefer cards view ──────────────────────────────────────────────────────
  if (!selectedSefer) {
    return (
      <div className="min-h-screen bg-parchment-50">
        <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="page-container">
            <h1 className="text-3xl font-bold text-ink-900 py-6 font-hebrew">
              שניים מקרא ואחד תרגום
            </h1>
            <p className="text-ink-700 pb-6 -mt-2">
              {isHe ? 'מעקב שניים מקרא ואחד תרגום' : "Shnayim Mikra v'Echad Targum Tracker"}
            </p>
          </div>
        </header>

        <main className="page-container">
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEFARIM.map((sefer) => {
              const seferParshiyos = parshiyos.filter(
                (p) => p.order >= sefer.min && p.order <= sefer.max
              );
              const total = seferParshiyos.length;
              const done = seferParshiyos.filter((p) => p.aliyos.every((a) => a.done)).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <button
                  key={sefer.nameEn}
                  onClick={() => setSelectedSefer(sefer)}
                  className="card p-6 text-start hover:bg-parchment-50 transition-colors"
                >
                  <h2 className="text-3xl font-hebrew font-bold text-ink-900 mb-1">
                    {isHe ? sefer.nameHe : sefer.nameEn}
                  </h2>
                  <p className="text-sm text-ink-500 mb-4 font-hebrew">
                    {isHe ? sefer.nameEn : sefer.nameHe} · {total} {isHe ? 'פרשיות' : 'parshiyos'}
                  </p>
                  <div className="w-full bg-parchment-200 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-sage-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-400">
                    {done}/{total} {isHe ? 'הושלמו' : 'complete'}
                  </p>
                </button>
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
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container">
          <div className="flex items-center gap-3 py-6">
            <button
              onClick={() => setSelectedSefer(null)}
              className="text-ink-400 hover:text-ink-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-ink-900 font-hebrew">
              {isHe ? selectedSefer.nameHe : selectedSefer.nameEn}
            </h1>
          </div>
        </div>
      </header>

      <main className="page-container">
        <div className="mt-8 space-y-3">
          {seferParshiyos.map((parsha) => {
            const isOpen = expandedId === parsha.id;
            const allDone = parsha.aliyos.every((a) => a.done);

            return (
              <div key={parsha.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : parsha.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-parchment-50 transition-colors text-start"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() => markParshaComplete(parsha.id, !allDone));
                        }}
                        disabled={isPending}
                        title={allDone ? (isHe ? 'בטל סימון' : 'Mark incomplete') : (isHe ? 'סמן הושלם' : 'Mark all done')}
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          allDone
                            ? 'bg-sage-500 text-white hover:bg-sage-600'
                            : 'border-2 border-parchment-300 text-parchment-300 hover:border-sage-400 hover:text-sage-400'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <h3 className="text-2xl font-hebrew font-semibold text-ink-900">
                        {parsha.name}
                      </h3>
                    </div>
                    <div className="flex gap-1.5 mt-1.5 ms-8">
                      {parsha.aliyos.map((a) => (
                        <div
                          key={a.id}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            a.done ? 'bg-sage-500' : 'bg-parchment-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <svg
                    className={`w-5 h-5 text-ink-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-parchment-200 p-4 space-y-3 bg-parchment-50/50">
                    {parsha.aliyos.map((aliyah) => (
                      <AliyahCard key={aliyah.id} aliyah={aliyah} parshaId={parsha.id} />
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
