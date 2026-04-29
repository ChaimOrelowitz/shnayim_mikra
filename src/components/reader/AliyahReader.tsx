'use client';

import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import type { VerseItem } from '@/lib/mock/bereishisAliyah1';
import { VerseUnit } from './VerseUnit';

export interface AliyahReaderHandle {
  save: () => void;
  justSaved: boolean;
}

interface AliyahReaderProps {
  verses: VerseItem[];
  savedVerseId: string | null;
  done: boolean;
  onSaveSpot: (verseId: string) => void;
  onMarkDone: () => void;
}

export const AliyahReader = forwardRef<AliyahReaderHandle, AliyahReaderProps>(function AliyahReader({ verses, savedVerseId, done, onSaveSpot, onMarkDone }, ref) {
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

    const nodes = Object.values(verseRefs.current);
    nodes.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses.length]);

  const savedIndex = useMemo(
    () => verses.findIndex((v) => v.id === savedVerseId),
    [verses, savedVerseId]
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
    onSaveSpot(id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }, [activeVerseId, onSaveSpot, verses]);

  useImperativeHandle(ref, () => ({ save: handleSave, justSaved }), [handleSave, justSaved]);

  return (
    <section className="mx-auto w-full max-w-2xl pb-6">
      {/* Info bar */}
      <div className="mb-1 rounded-2xl border border-parchment-200 bg-white px-5 py-3 shadow-sm sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-500 font-hebrew">
              {verses[0]?.hebrewRef ?? ''}
              {verses.length > 1 ? ` – ${verses[verses.length - 1]?.hebrewRef}` : ''}
            </p>
            {savedVerseId && !done && savedIndex >= 0 && (
              <p className="text-[0.7rem] text-ink-400 mt-0.5">
                Saved through <span className="font-medium text-ink-600">{verses[savedIndex].hebrewRef}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {nextResumeVerse && (
              <button
                type="button"
                onClick={handleResume}
                className="rounded-full border border-parchment-300 bg-parchment-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-parchment-100"
              >
                Resume ↓
              </button>
            )}
            {done && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verse flow */}
      <div className="rounded-2xl border border-parchment-200 bg-white px-5 py-8 shadow-sm sm:px-9">
        <div className="space-y-0">
          {verses.map((verse, index) => (
            <VerseUnit
              key={verse.id}
              verse={verse}
              isActive={activeVerseId === verse.id}
              isCompleted={savedIndex >= 0 && index <= savedIndex && !done}
              containerRef={(el) => { verseRefs.current[verse.id] = el; }}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-end border-t border-parchment-100 pt-6">
          <button
            type="button"
            onClick={onMarkDone}
            disabled={done}
            className="rounded-full bg-parchment-100 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-parchment-200 disabled:opacity-40"
          >
            {done ? '✓ Aliyah done' : 'Mark aliyah done'}
          </button>
        </div>
      </div>
    </section>
  );
});
