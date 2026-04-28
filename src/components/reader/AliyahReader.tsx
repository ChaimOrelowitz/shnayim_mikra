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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const activeVerse = verses.find((v) => v.id === activeVerseId);

  return (
    <section className="mx-auto w-full max-w-2xl pb-32">
      {/* Header card */}
      <div className="mb-1 rounded-2xl border border-parchment-200 bg-white px-5 py-5 shadow-sm sm:px-7">
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-blue-700">
          שניים מקרא
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Bereishis · Aliyah 1</h2>
            <p className="text-xs text-ink-400">בראשית א:א – א:ח</p>
          </div>
          <div className="flex items-center gap-2">
            {nextResumeVerse && (
              <button
                type="button"
                onClick={handleResume}
                className="rounded-full border border-parchment-300 bg-parchment-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-parchment-100"
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

        {savedVerseId && !done && (
          <p className="mt-2 text-xs text-ink-400">
            Saved through{' '}
            <span className="font-medium text-ink-600">
              {savedIndex >= 0 ? verses[savedIndex].hebrewRef : savedVerseId}
            </span>
          </p>
        )}
      </div>

      {/* Verse flow */}
      <div ref={containerRef} className="rounded-2xl border border-parchment-200 bg-white px-5 py-8 shadow-sm sm:px-9">
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

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-stretch gap-3 border-t border-parchment-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-400">
            Reading:{' '}
            <span className="font-medium text-ink-700">{activeVerse?.hebrewRef ?? '—'}</span>
          </p>
          <div className="flex gap-2">
            {/* Desktop save button */}
            <button
              type="button"
              onClick={handleSave}
              className={`hidden rounded-full px-4 py-2 text-sm font-medium transition sm:inline-flex ${
                justSaved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {justSaved ? '✓ Saved' : 'Bookmark Chumash'}
            </button>
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
      </div>

    </section>
  );
});
