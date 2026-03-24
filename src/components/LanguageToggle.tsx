'use client';

import { useLanguage } from '@/lib/language';

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 flex rounded-full border border-parchment-300 bg-white/90 shadow-sm overflow-hidden text-sm font-medium"
      title={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
    >
      <span
        className={`px-3 py-1.5 transition-colors ${
          lang === 'en' ? 'bg-sage-500 text-white' : 'text-ink-600 hover:bg-parchment-100'
        }`}
      >
        Ab
      </span>
      <span
        className={`px-3 py-1.5 font-hebrew transition-colors ${
          lang === 'he' ? 'bg-sage-500 text-white' : 'text-ink-600 hover:bg-parchment-100'
        }`}
      >
        ע
      </span>
    </button>
  );
}
