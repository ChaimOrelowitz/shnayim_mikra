'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AliyahReader, type AliyahReaderHandle } from '@/components/reader/AliyahReader';
import { RashiReader, type RashiReaderHandle } from '@/components/reader/RashiReader';
import { FloatingSaveButton } from '@/components/reader/FloatingSaveButton';
import { readerBookmarkChumash, updateAliyahProgress } from '@/app/actions';
import type { VerseItem } from '@/lib/mock/bereishisAliyah1';

interface Props {
  aliyahId: string;
  parshaId: string;
  hebrewYear: number;
  verses: VerseItem[];
  parshaName: string;
  aliyahNumber: number;
  initialSavedVerseId: string | null;
  initialAliyahDone: boolean;
  initialRashiDone: boolean;
}

export function ReaderClient({
  aliyahId,
  parshaId,
  hebrewYear,
  verses,
  parshaName,
  aliyahNumber,
  initialSavedVerseId,
  initialAliyahDone,
  initialRashiDone,
}: Props) {
  const [savedVerseId, setSavedVerseId] = useState(initialSavedVerseId);
  const [savedRashiVerseId, setSavedRashiVerseId] = useState<string | null>(null);
  const [aliyahDone, setAliyahDone] = useState(initialAliyahDone);
  const [rashiDone, setRashiDone] = useState(initialRashiDone);
  const [inRashiSection, setInRashiSection] = useState(false);
  const [, startTransition] = useTransition();

  const aliyahRef = useRef<AliyahReaderHandle>(null);
  const rashiRef = useRef<RashiReaderHandle>(null);
  const rashiSectionRef = useRef<HTMLElement>(null);

  // Rashi position is localStorage-only (no per-pasuk Rashi field in DB yet)
  const rashiKey = `reader:rashiSpot:${aliyahId}`;

  useEffect(() => {
    setSavedRashiVerseId(localStorage.getItem(rashiKey));
  }, [rashiKey]);

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

  function saveAliyahSpot(verseId: string) {
    setSavedVerseId(verseId);
    setAliyahDone(false);
    startTransition(async () => {
      await readerBookmarkChumash(aliyahId, verseId, hebrewYear);
    });
  }

  function saveRashiSpot(verseId: string) {
    localStorage.setItem(rashiKey, verseId);
    setSavedRashiVerseId(verseId);
    setRashiDone(false);
  }

  function markAliyahDone() {
    setAliyahDone(true);
    startTransition(async () => {
      await updateAliyahProgress(aliyahId, 'done', true, hebrewYear);
    });
  }

  function markRashiDone() {
    setRashiDone(true);
    startTransition(async () => {
      await updateAliyahProgress(aliyahId, 'rashiReview', true, hebrewYear);
    });
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

  const ALIYAH_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'];

  return (
    <main className="min-h-screen bg-parchment-50">
      <div className="sticky top-0 z-10 border-b border-parchment-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link href={`/parsha/${parshaId}?year=${hebrewYear}`} className="text-ink-400 hover:text-ink-700 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-ink-400">שניים מקרא</p>
            <h1 className="font-hebrew text-lg font-semibold text-ink-900">
              {parshaName} · עליה {ALIYAH_HEB[aliyahNumber - 1] ?? String(aliyahNumber)}
            </h1>
          </div>
          {/* spacer to balance the back arrow */}
          <div className="w-5" />
        </div>
      </div>

      <div className="px-3 py-6 sm:px-6">
        <AliyahReader
          ref={aliyahRef}
          verses={verses}
          savedVerseId={savedVerseId}
          done={aliyahDone}
          onSaveSpot={saveAliyahSpot}
          onMarkDone={markAliyahDone}
          parshaName={parshaName}
          aliyahNumber={aliyahNumber}
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
