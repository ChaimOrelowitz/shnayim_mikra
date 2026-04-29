'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AliyahReader, type AliyahReaderHandle } from '@/components/reader/AliyahReader';
import { RashiReader, type RashiReaderHandle } from '@/components/reader/RashiReader';
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
  const [justSaved, setJustSaved] = useState(false);
  const [, startTransition] = useTransition();

  const aliyahRef = useRef<AliyahReaderHandle>(null);
  const rashiRef = useRef<RashiReaderHandle>(null);
  const rashiSentinelRef = useRef<HTMLDivElement>(null);
  const justSavedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const rashiKey = `reader:rashiSpot:${aliyahId}`;

  useEffect(() => {
    setSavedRashiVerseId(localStorage.getItem(rashiKey));
  }, [rashiKey]);

  // Switch header button between Chumash/Rashi once user scrolls past the sentinel
  useEffect(() => {
    const el = rashiSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setInRashiSection(true);
        } else {
          setInRashiSection(false);
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function flash() {
    setJustSaved(true);
    clearTimeout(justSavedTimer.current);
    justSavedTimer.current = setTimeout(() => setJustSaved(false), 1800);
  }

  function saveAliyahSpot(verseId: string) {
    setSavedVerseId(verseId);
    setAliyahDone(false);
    flash();
    startTransition(async () => {
      await readerBookmarkChumash(aliyahId, verseId, hebrewYear);
    });
  }

  function saveRashiSpot(verseId: string) {
    localStorage.setItem(rashiKey, verseId);
    setSavedRashiVerseId(verseId);
    setRashiDone(false);
    flash();
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

  function handleHeaderSave() {
    if (inRashiSection) {
      rashiRef.current?.save();
    } else {
      aliyahRef.current?.save();
    }
  }

  const ALIYAH_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'];

  return (
    <main className="min-h-screen bg-parchment-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-parchment-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href={`/parsha/${parshaId}?year=${hebrewYear}`}
            className="shrink-0 text-ink-400 hover:text-ink-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-ink-400">שניים מקרא</p>
            <h1 className="font-hebrew text-base font-semibold text-ink-900 truncate leading-tight">
              {parshaName} · עליה {ALIYAH_HEB[aliyahNumber - 1] ?? String(aliyahNumber)}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleHeaderSave}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
              justSaved
                ? 'bg-green-100 text-green-700'
                : inRashiSection
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {justSaved ? '✓ Saved' : inRashiSection ? 'Bookmark Rashi' : 'Bookmark'}
          </button>
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
        />

        {/* Sentinel: scrolling past this flips the header button to Rashi mode */}
        <div ref={rashiSentinelRef} aria-hidden />

        <RashiReader
          ref={rashiRef}
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
