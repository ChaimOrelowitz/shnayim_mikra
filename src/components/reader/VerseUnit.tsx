import type { VerseItem } from '@/lib/mock/bereishisAliyah1';

interface VerseUnitProps {
  verse: VerseItem;
  isActive: boolean;
  isCompleted: boolean;
  containerRef: (node: HTMLDivElement | null) => void;
}

export function VerseUnit({ verse, isActive, isCompleted, containerRef }: VerseUnitProps) {
  return (
    <article
      id={verse.id}
      ref={containerRef}
      data-verse-id={verse.id}
      dir="rtl"
      className={`border-b border-parchment-100 pb-6 transition-opacity duration-300 last:border-b-0 ${
        isCompleted ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Verse reference */}
      <a
        href={`#${verse.id}`}
        className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-ink-400 hover:bg-parchment-100'
        }`}
      >
        {verse.hebrewRef}
      </a>

      {/* First Mikra — large, primary reading */}
      <p className="font-hebrew text-[1.65rem] leading-[1.85] tracking-wide text-ink-900">
        {verse.mikra}
      </p>

      {/* Second Mikra — same text, slightly smaller than first, black */}
      <p className="font-hebrew mt-2 text-xl leading-[1.9] tracking-wide text-ink-900">
        {verse.mikra}
      </p>

      {/* Targum — visually distinct: indented, lighter grey */}
      <p
        dir="rtl"
        className="mt-3 border-r-2 border-parchment-300 pr-4 font-hebrew text-lg leading-[1.95] tracking-wide text-ink-400 italic-none"
      >
        {verse.targum}
      </p>
    </article>
  );
}
