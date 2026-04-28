'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VerseItem } from '@/lib/mock/bereishisAliyah1';

interface RashiReaderProps {
  verses: VerseItem[];
  savedRashiVerseId: string | null;
  done: boolean;
  onSaveRashiSpot: (verseId: string) => void;
  onMarkRashiDone: () => void;
}

export function RashiReader({ verses, savedRashiVerseId, done, onSaveRashiSpot, onMarkRashiDone }: RashiReaderProps) {
  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const verseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        }
        if (best) {
          const id = best.target.getAttribute('data-verse-id');
          if (id) setActiveVerseId(id);
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-15% 0px -35% 0px' }
    );

    Object.values(verseRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses.length]);

  const savedIndex = useMemo(
    () => verses.findIndex((v) => v.id === savedRashiVerseId),
    [verses, savedRashiVerseId]
  );

  const nextResumeVerse = useMemo(() => {
    if (done) return null;
    if (savedIndex >= 0 && savedIndex + 1 < verses.length) return verses[savedIndex + 1];
    if (savedIndex === -1) return verses[0];
    return null;
  }, [done, savedIndex, verses]);

  const handleResume = useCallback(() => {
    if (!nextResumeVerse) return;
    verseRefs.current[nextResumeVerse.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [nextResumeVerse]);

  const handleSave = useCallback(() => {
    const id = activeVerseId ?? verses[0]?.id;
    if (!id) return;
    onSaveRashiSpot(id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }, [activeVerseId, onSaveRashiSpot, verses]);

  const activeVerse = verses.find((v) => v.id === activeVerseId);

  return (
    <section className="mx-auto w-full max-w-2xl pb-16 pt-8">
      {/* Header card */}
      <div className="mb-1 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm sm:px-7">
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-amber-700">
          רש״י
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Rashi · Bereishis 1</h2>
            <p className="text-xs text-ink-400">Tracked independently from Shnayim Mikra</p>
          </div>
          <div className="flex items-center gap-2">
            {nextResumeVerse && (
              <button
                type="button"
                onClick={handleResume}
                className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Resume at {nextResumeVerse.hebrewRef} ↓
              </button>
            )}
            {done && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✓ Done
              </span>
            )}
          </div>
        </div>
        {savedRashiVerseId && !done && (
          <p className="mt-2 text-xs text-ink-400">
            Saved through{' '}
            <span className="font-medium text-ink-600">
              {savedIndex >= 0 ? verses[savedIndex].hebrewRef : savedRashiVerseId}
            </span>
          </p>
        )}
      </div>

      {/* Rashi entries */}
      <div className="rounded-2xl border border-amber-100 bg-white px-5 py-8 shadow-sm sm:px-9">
        <div className="space-y-8">
          {verses.map((verse, index) => {
            const isCompleted = savedIndex >= 0 && index <= savedIndex && !done;
            const isActive = activeVerseId === verse.id;

            return (
              <div
                key={verse.id}
                id={`rashi-${verse.id}`}
                data-verse-id={verse.id}
                ref={(el) => { verseRefs.current[verse.id] = el; }}
                className={`transition-opacity duration-300 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}
              >
                <a
                  href={`#rashi-${verse.id}`}
                  className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    isActive ? 'bg-amber-100 text-amber-700' : 'text-ink-400 hover:bg-parchment-100'
                  }`}
                >
                  {verse.hebrewRef}
                </a>
                <div dir="rtl" className="space-y-3">
                  {verse.rashi.map((note, i) => (
                    <p
                      key={i}
                      className="font-hebrew text-base leading-[1.95] tracking-wide text-ink-800"
                    >
                      {note}
                    </p>
                  ))}
                </div>
                {index < verses.length - 1 && (
                  <div className="mt-8 border-b border-amber-100" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-stretch gap-3 border-t border-amber-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-400">
            Reading:{' '}
            <span className="font-medium text-ink-700">{activeVerse?.hebrewRef ?? '—'}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                justSaved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {justSaved ? '✓ Saved' : 'Save Rashi spot'}
            </button>
            <button
              type="button"
              onClick={onMarkRashiDone}
              disabled={done}
              className="rounded-full bg-parchment-100 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-parchment-200 disabled:opacity-40"
            >
              {done ? '✓ Rashi done' : 'Mark Rashi done'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
