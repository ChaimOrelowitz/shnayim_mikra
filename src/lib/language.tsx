'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'en' | 'he';

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('smt-lang') as Lang | null;
    if (stored === 'en' || stored === 'he') setLang(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'he' ? 'he' : 'en';
  }, [lang]);

  const toggle = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'he' : 'en';
      localStorage.setItem('smt-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

const ALIYAH_NAMES_HE = ['כהן', 'לוי', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי'];

export function aliyahLabel(number: number, lang: Lang): string {
  if (lang === 'he') return ALIYAH_NAMES_HE[number - 1] ?? String(number);
  return `Aliyah ${number}`;
}

export function toHebrewNumeral(n: number): string {
  if (n <= 0) return String(n);
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];

  if (n === 15) return 'טו';
  if (n === 16) return 'טז';

  let result = '';
  let rem = n;
  if (rem >= 100) { result += hundreds[Math.floor(rem / 100)]; rem %= 100; }
  if (rem >= 10)  { result += tens[Math.floor(rem / 10)];      rem %= 10; }
  result += ones[rem];
  return result;
}
