'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PasukRow } from './PasukRow';
import { useLanguage, aliyahLabel, toHebrewNumeral } from '@/lib/language';

interface Pasuk {
  id: string;
  perek: number;
  pasuk: number;
  done: boolean;
  mikra1: boolean;
  mikra2: boolean;
  targum: boolean;
}

interface AliyahViewProps {
  aliyah: {
    id: string;
    number: number;
    parshaId: string;
    pdfPath: string | null;
    parsha: { name: string };
  };
  pesukim: Pasuk[];
}

export function AliyahView({ aliyah, pesukim }: AliyahViewProps) {
  const { lang } = useLanguage();
  const isHe = lang === 'he';
  const [showPdf, setShowPdf] = useState(false);

  const totalPesukim = pesukim.length;
  const donePesukim = pesukim.filter((p) => p.done).length;

  const pesukimByPerek = pesukim.reduce((acc, p) => {
    if (!acc[p.perek]) acc[p.perek] = [];
    acc[p.perek].push(p);
    return acc;
  }, {} as Record<number, Pasuk[]>);

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container">
          <div className="flex items-center gap-4 py-6">
            <Link
              href={`/parsha/${aliyah.parshaId}`}
              className="text-sage-600 hover:text-sage-700"
              aria-label="Back to parsha"
            >
              <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold text-ink-900 font-hebrew">
                  {aliyah.parsha.name}
                </h1>
                <span className="text-lg text-ink-600 font-hebrew">
                  • {aliyahLabel(aliyah.number, lang)}
                </span>
              </div>
              <p className="text-sm text-ink-600 mt-1 font-hebrew">
                {isHe
                  ? `${donePesukim} מתוך ${totalPesukim} פסוקים הושלמו`
                  : `${donePesukim} of ${totalPesukim} pesukim completed`}
              </p>
            </div>

            {aliyah.pdfPath && (
              <button
                onClick={() => setShowPdf(true)}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {isHe ? 'פתח PDF' : 'Open PDF'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="page-container">
        <div className="mt-6">
          {/* Pesukim grouped by perek */}
          <div className="space-y-6">
            {Object.entries(pesukimByPerek)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([perek, perekPesukim]) => (
                <div key={perek} className="card overflow-hidden">
                  <div className="bg-sage-50 border-b border-sage-200 px-4 py-3">
                    <h2 className="text-lg font-semibold text-sage-900 font-hebrew">
                      {isHe ? `פרק ${toHebrewNumeral(Number(perek))}` : `Perek ${perek}`}
                    </h2>
                  </div>
                  <div className="divide-y divide-parchment-200">
                    {perekPesukim.map((p) => (
                      <PasukRow key={p.id} pasuk={p} />
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {totalPesukim === 0 && (
            <div className="card p-12 text-center">
              <p className="text-ink-600">
                {isHe ? 'לא נמצאו פסוקים.' : 'No pesukim found for this aliyah.'}
              </p>
            </div>
          )}
        </div>
      </main>
      {showPdf && aliyah.pdfPath && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60" onClick={() => setShowPdf(false)}>
          <div className="flex items-center justify-between px-4 py-2 bg-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-medium text-ink-700 font-hebrew">
              {aliyah.parsha.name} — {aliyahLabel(aliyah.number, lang)}
            </span>
            <button onClick={() => setShowPdf(false)} className="p-1 text-ink-500 hover:text-ink-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src={aliyah.pdfPath}
            className="flex-1 w-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
