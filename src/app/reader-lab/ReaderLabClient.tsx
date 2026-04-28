'use client';

import { useEffect, useRef, useState } from 'react';
import { AliyahReader, type AliyahReaderHandle } from '@/components/reader/AliyahReader';
import { RashiReader, type RashiReaderHandle } from '@/components/reader/RashiReader';
import { FloatingSaveButton } from '@/components/reader/FloatingSaveButton';
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
  const [inRashiSection, setInRashiSection] = useState(false);

  const aliyahRef = useRef<AliyahReaderHandle>(null);
  const rashiRef = useRef<RashiReaderHandle>(null);
  const rashiSectionRef = useRef<HTMLElement>(null);

  // Detect when user scrolls into Rashi section
  useEffect(() => {
    const el = rashiSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInRashiSection(entry.isIntersecting),
      { threshold: 0.75 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const handleFloatingPress = () => {
    if (inRashiSection) {
      rashiRef.current?.save();
    } else {
      aliyahRef.current?.save();
    }
  };

  const justSaved = inRashiSection
    ? (rashiRef.current?.justSaved ?? false)
    : (aliyahRef.current?.justSaved ?? false);

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
          ref={aliyahRef}
          verses={verses}
          savedVerseId={savedVerseId}
          done={aliyahDone}
          onSaveSpot={saveAliyahSpot}
          onMarkDone={markAliyahDone}
        />

        <RashiReader
          ref={rashiRef}
          sectionRef={rashiSectionRef}
          verses={verses}
          savedRashiVerseId={savedRashiVerseId}
          done={rashiDone}
          onSaveRashiSpot={saveRashiSpot}
          onMarkRashiDone={markRashiDone}
        />
      </div>

      <FloatingSaveButton
        label={justSaved ? '✓ Saved' : inRashiSection ? 'Bookmark Rashi' : 'Bookmark Chumash'}
        saved={justSaved}
        mode={inRashiSection ? 'rashi' : 'chumash'}
        onClick={handleFloatingPress}
      />
    </main>
  );
}

const ALIYAH_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'];
function toHebAliyah(n: number) { return ALIYAH_HEB[n - 1] ?? String(n); }
