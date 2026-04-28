'use client';

import { useEffect, useState } from 'react';
import { AliyahReader } from '@/components/reader/AliyahReader';
import { RashiReader } from '@/components/reader/RashiReader';
import type { VerseItem } from '@/lib/mock/bereishisAliyah1';

const KEYS = {
  aliyahSpot: 'readerLab:shnayimLastCompletedVerseId',
  rashiSpot: 'readerLab:rashiLastCompletedVerseId',
  aliyahDone: 'readerLab:aliyahDone',
  rashiDone: 'readerLab:rashiDone',
} as const;

interface Props {
  verses: VerseItem[];
  parshaName: string;
  aliyahNumber: number;
}

export function ReaderLabClient({ verses, parshaName, aliyahNumber }: Props) {
  const [savedVerseId, setSavedVerseId] = useState<string | null>(null);
  const [savedRashiVerseId, setSavedRashiVerseId] = useState<string | null>(null);
  const [aliyahDone, setAliyahDone] = useState(false);
  const [rashiDone, setRashiDone] = useState(false);

  useEffect(() => {
    setSavedVerseId(localStorage.getItem(KEYS.aliyahSpot));
    setSavedRashiVerseId(localStorage.getItem(KEYS.rashiSpot));
    setAliyahDone(localStorage.getItem(KEYS.aliyahDone) === '1');
    setRashiDone(localStorage.getItem(KEYS.rashiDone) === '1');
  }, []);

  function saveAliyahSpot(verseId: string) {
    localStorage.setItem(KEYS.aliyahSpot, verseId);
    localStorage.setItem(KEYS.aliyahDone, '0');
    setSavedVerseId(verseId);
    setAliyahDone(false);
  }

  function saveRashiSpot(verseId: string) {
    localStorage.setItem(KEYS.rashiSpot, verseId);
    localStorage.setItem(KEYS.rashiDone, '0');
    setSavedRashiVerseId(verseId);
    setRashiDone(false);
  }

  function markAliyahDone() {
    localStorage.setItem(KEYS.aliyahDone, '1');
    setAliyahDone(true);
  }

  function markRashiDone() {
    localStorage.setItem(KEYS.rashiDone, '1');
    setRashiDone(true);
  }

  return (
    <main className="min-h-screen bg-parchment-50">
      <div className="border-b border-parchment-200 bg-white px-4 py-3 text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-ink-400">
          Reader Lab · Experimental
        </p>
        <h1 className="font-hebrew text-lg font-semibold text-ink-900">
          {parshaName} · עליה {toHebAliyah(aliyahNumber)}
        </h1>
      </div>

      <div className="px-3 py-6 sm:px-6">
        <AliyahReader
          verses={verses}
          savedVerseId={savedVerseId}
          done={aliyahDone}
          onSaveSpot={saveAliyahSpot}
          onMarkDone={markAliyahDone}
        />

        <RashiReader
          verses={verses}
          savedRashiVerseId={savedRashiVerseId}
          done={rashiDone}
          onSaveRashiSpot={saveRashiSpot}
          onMarkRashiDone={markRashiDone}
        />
      </div>
    </main>
  );
}

const ALIYAH_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'];
function toHebAliyah(n: number) { return ALIYAH_HEB[n - 1] ?? String(n); }
