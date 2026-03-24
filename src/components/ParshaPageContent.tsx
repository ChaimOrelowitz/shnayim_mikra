'use client';

import Link from 'next/link';
import { AliyahCard } from './AliyahCard';
import { useLanguage } from '@/lib/language';

interface Aliyah {
  id: string;
  number: number;
  done: boolean;
  mikra1: boolean;
  mikra2: boolean;
  targum: boolean;
  pdfPath: string | null;
}

interface ParshaPageContentProps {
  parsha: {
    id: string;
    name: string;
    aliyos: Aliyah[];
  };
}

export function ParshaPageContent({ parsha }: ParshaPageContentProps) {
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container">
          <div className="flex items-center gap-4 py-6">
            <Link href="/" className="text-sage-600 hover:text-sage-700" aria-label="Back to home">
              <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-ink-900 font-hebrew">{parsha.name}</h1>
              <p className="text-sm text-ink-600 mt-1 font-hebrew">
                {parsha.aliyos.length} {isHe ? 'עליות' : 'Aliyos'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container">
        <div className="mt-8 space-y-4">
          {parsha.aliyos.map((aliyah) => (
            <AliyahCard key={aliyah.id} aliyah={aliyah} parshaId={parsha.id} />
          ))}
        </div>
      </main>
    </div>
  );
}
