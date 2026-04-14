'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/actions';
import { useLanguage } from '@/lib/language';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { lang, toggle } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        className="p-2 rounded-full hover:bg-parchment-100 transition-colors text-ink-500 hover:text-ink-800"
      >
        {/* Person icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-parchment-300 py-1 z-50">
          {/* Language */}
          <div className="px-3 py-2.5 flex items-center justify-between">
            <span className="text-xs text-ink-500">Language</span>
            <button
              onClick={toggle}
              className="flex rounded border border-parchment-300 overflow-hidden text-xs font-medium"
            >
              <span className={`px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-sage-500 text-white' : 'text-ink-600 hover:bg-parchment-100'}`}>
                Ab
              </span>
              <span className={`px-2.5 py-1 font-hebrew transition-colors ${lang === 'he' ? 'bg-sage-500 text-white' : 'text-ink-600 hover:bg-parchment-100'}`}>
                ע
              </span>
            </button>
          </div>

          <div className="border-t border-parchment-200" />

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-parchment-50 transition-colors"
          >
            {/* Gear icon */}
            <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>

          <div className="border-t border-parchment-200" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-ink-700 hover:bg-parchment-50 transition-colors"
            >
              {/* Sign out icon */}
              <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
