'use client';

import { useState, useTransition } from 'react';
import { useLanguage } from '@/lib/language';
import { AliyahCard } from './AliyahCard';
import { markParshaComplete } from '@/app/actions';

const SEFARIM: { nameHe: string; nameEn: string; min: number; max: number }[] = [
  { nameHe: 'ספר בראשית',  nameEn: 'Bereishit', min: 1,  max: 12 },
  { nameHe: 'ספר שמות',    nameEn: 'Shemot',    min: 13, max: 23 },
  { nameHe: 'ספר ויקרא',   nameEn: 'Vayikra',   min: 24, max: 33 },
  { nameHe: 'ספר במדבר',   nameEn: 'Bamidbar',  min: 34, max: 43 },
  { nameHe: 'ספר דברים',   nameEn: 'Devarim',   min: 44, max: 54 },
];

function getSeferForOrder(order: number) {
  return SEFARIM.find((s) => order >= s.min && order <= s.max);
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
        <div className="mt-8 space-y-10">
          {SEFARIM.map((sefer) => {
            const seferParshiyos = parshiyos.filter(
              (p) => p.order >= sefer.min && p.order <= sefer.max
            );
            if (seferParshiyos.length === 0) return null;

            return (
              <div key={sefer.nameEn}>
                <h2 className="text-lg font-semibold text-ink-500 uppercase tracking-wide mb-3 font-hebrew border-b border-parchment-300 pb-2">
                  {isHe ? sefer.nameHe : sefer.nameEn}
                </h2>

                <div className="space-y-3">
                  {seferParshiyos.map((parsha) => {
                    const isOpen = expandedId === parsha.id;

                    return (
                      <div key={parsha.id} className="card overflow-hidden">
                        <div className="flex items-center">
                          <button
                            onClick={() => setExpandedId(isOpen ? null : parsha.id)}
                            className="flex-1 p-5 flex items-center justify-between hover:bg-parchment-50 transition-colors text-start"
                          >
                            <div>
                              <h3 className="text-2xl font-hebrew font-semibold text-ink-900">
                                {parsha.name}
                              </h3>
                              <div className="flex gap-1.5 mt-1.5">
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

                          {(() => {
                            const allDone = parsha.aliyos.every((a) => a.done);
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startTransition(() => markParshaComplete(parsha.id, !allDone));
                                }}
                                disabled={isPending}
                                title={allDone ? (isHe ? 'בטל סימון הושלם' : 'Mark incomplete') : (isHe ? 'סמן הושלם' : 'Mark all done')}
                                className={`mx-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  allDone
                                    ? 'bg-sage-500 text-white hover:bg-sage-600'
                                    : 'border-2 border-parchment-300 text-parchment-300 hover:border-sage-400 hover:text-sage-400'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            );
                          })()}
                        </div>

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
              </div>
            );
          })}

          {parshiyos.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-ink-600">
                {isHe ? 'אין פרשיות עדיין.' : 'No parshiyos yet. Run the seed script to add sample data.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
