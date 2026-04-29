'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Toggle } from './Toggle';
import { PDFUploader } from './PDFUploader';
import { updateAliyahProgress, removePDF } from '@/app/actions';
import { useLanguage, aliyahLabel } from '@/lib/language';

interface AliyahCardProps {
  aliyah: {
    id: string;
    number: number;
    done: boolean;
    mikra1: boolean;
    mikra2: boolean;
    targum: boolean;
    rashiReview: boolean;
    pdfPath: string | null;
  };
  parshaId: string;
  isAdmin?: boolean;
  hebrewYear: number;
}

export function AliyahCard({ aliyah, parshaId, isAdmin, hebrewYear }: AliyahCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showUploader, setShowUploader] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  const handleToggle = (field: 'done' | 'mikra1' | 'mikra2' | 'targum' | 'rashiReview', value: boolean) => {
    startTransition(async () => {
      await updateAliyahProgress(aliyah.id, field, value, hebrewYear);
    });
  };

  const handleRemovePDF = () => {
    if (confirm('Remove this PDF?')) {
      startTransition(async () => {
        await removePDF(aliyah.id);
      });
    }
  };

  const three = [
    { field: 'mikra1' as const, label: isHe ? 'מקרא א' : 'Mikra 1', checked: aliyah.mikra1 },
    { field: 'mikra2' as const, label: isHe ? 'מקרא ב' : 'Mikra 2', checked: aliyah.mikra2 },
    { field: 'targum' as const, label: isHe ? 'תרגום' : 'Targum',   checked: aliyah.targum  },
  ];

  const isFullyDone = aliyah.mikra1 && aliyah.mikra2 && aliyah.targum;

  const pdfModal = showPdf && aliyah.pdfPath && (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60" onClick={() => setShowPdf(false)}>
      <div className="flex items-center justify-between px-4 py-2 bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink-700 font-hebrew">{aliyahLabel(aliyah.number, lang)}</span>
          <a href={aliyah.pdfPath} target="_blank" rel="noopener noreferrer" className="text-xs text-sage-600 hover:text-sage-700 underline">
            {isHe ? 'פתח בלשונית חדשה' : 'Open in new tab'}
          </a>
        </div>
        <button onClick={() => setShowPdf(false)} className="p-1 text-ink-500 hover:text-ink-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <iframe src={aliyah.pdfPath} className="flex-1 w-full" onClick={(e) => e.stopPropagation()} />
    </div>
  );

  // ── Mobile card ───────────────────────────────────────────────────────────
  const mobileCard = (
    <div className={`sm:hidden card p-3 transition-all duration-300 ${isFullyDone ? 'border-l-4 border-l-sage-500 bg-sage-50/40' : ''}`}>
      {/* Top: done circle + aliyah name centered */}
      <div className="flex items-baseline justify-center gap-2 mb-2">
        <Toggle
          checked={aliyah.done}
          onChange={(value) => handleToggle('done', value)}
          label="Done"
          disabled={isPending}
        />
        <span className="font-hebrew text-[1.05rem] font-bold text-ink-900">
          {aliyahLabel(aliyah.number, 'he')}
        </span>
      </div>

      {/* Body: toggles left, buttons right */}
      <div className="flex items-start justify-between">
        {/* 2×2 toggle grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 content-center">
          {three.map(({ field, label, checked }) => (
            <div key={field} className="flex items-center gap-1.5">
              <Toggle
                checked={checked}
                onChange={(value) => handleToggle(field, value)}
                label={label}
                disabled={isPending}
              />
              <span className="text-[11px] font-hebrew text-ink-600">{label}</span>
            </div>
          ))}
          {/* Rashi */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggle('rashiReview', !aliyah.rashiReview)}
              disabled={isPending}
              aria-label="Rashi review"
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-rashi text-sm transition-all touch-manipulation ${
                aliyah.rashiReview
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-parchment-300 text-ink-400 hover:border-amber-400 hover:text-amber-500'
              }`}
            >
              ר
            </button>
            <span className="text-[11px] font-hebrew text-amber-700">Rashi</span>
          </div>
        </div>

        {/* Open + PDF stacked buttons */}
        <div className="flex flex-col gap-1 w-16">
          <Link
            href={`/aliyah/${aliyah.id}?year=${hebrewYear}`}
            className="h-8 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold font-hebrew flex items-center justify-center transition-colors"
          >
            Read
          </Link>
          {aliyah.pdfPath && (
            <button
              onClick={() => setShowPdf(true)}
              className="h-5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[11px] font-semibold font-hebrew flex items-center justify-center transition-colors"
            >
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Admin PDF uploader */}
      {isAdmin && !aliyah.pdfPath && (
        showUploader ? (
          <div className="mt-2">
            <PDFUploader aliyahId={aliyah.id} onComplete={() => setShowUploader(false)} onCancel={() => setShowUploader(false)} />
          </div>
        ) : (
          <button onClick={() => setShowUploader(true)} disabled={isPending} className="mt-2 text-xs text-ink-400 hover:text-sage-600 transition-colors">
            + Upload PDF
          </button>
        )
      )}
      {isAdmin && aliyah.pdfPath && (
        <button onClick={handleRemovePDF} disabled={isPending} className="mt-1 text-[10px] text-parchment-400 hover:text-red-500 transition-colors">
          Remove PDF
        </button>
      )}

      {pdfModal}
    </div>
  );

  // ── Desktop card (unchanged) ──────────────────────────────────────────────
  const desktopCard = (
    <div className={`hidden sm:block card p-4 transition-all duration-300 ${isFullyDone ? 'border-l-4 border-l-sage-500 bg-sage-50/40' : ''}`}>
      {/* Row 1: aliyah name + done check + view details */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-ink-900 font-hebrew">
            {aliyahLabel(aliyah.number, lang)}
          </h3>
          <div className="flex items-center gap-1.5">
            <Toggle
              checked={aliyah.done}
              onChange={(value) => handleToggle('done', value)}
              label="Done"
              disabled={isPending}
            />
            <span className="text-xs text-ink-600 font-hebrew">
              {isHe ? 'הושלם' : 'Done'}
            </span>
          </div>
        </div>

        <Link
          href={`/aliyah/${aliyah.id}?year=${hebrewYear}`}
          className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-700 font-medium font-hebrew"
        >
          {isHe ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              פסוקים
            </>
          ) : (
            <>
              Pesukim
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Link>
      </div>

      {/* Row 2: Mikra 1, Mikra 2, Targum + PDF */}
      <div className="flex items-center gap-5 flex-wrap">
        {three.map(({ field, label, checked }) => (
          <div key={field} className="flex items-center gap-1.5">
            <Toggle
              checked={checked}
              onChange={(value) => handleToggle(field, value)}
              label={label}
              disabled={isPending}
            />
            <span className="text-xs text-ink-600 font-hebrew">{label}</span>
          </div>
        ))}

        <div className="flex items-center gap-1.5 border-l border-parchment-200 pl-4 ml-1">
          <button
            onClick={() => handleToggle('rashiReview', !aliyah.rashiReview)}
            disabled={isPending}
            title={isHe ? 'חזרת רש"י' : 'Rashi review'}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold font-hebrew transition-all touch-manipulation ${
              aliyah.rashiReview
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white border-parchment-300 text-ink-400 hover:border-amber-400 hover:text-amber-500'
            }`}
          >
            ר
          </button>
          <span className="text-xs text-ink-500 font-hebrew">{isHe ? 'רש"י' : 'Rashi'}</span>
        </div>

        <div className="ms-auto flex items-center gap-1.5">
          {aliyah.pdfPath ? (
            <>
              <button
                onClick={() => setShowPdf(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-hebrew">{isHe ? 'פתח PDF' : 'Open PDF'}</span>
              </button>
              {isAdmin && (
                <button onClick={handleRemovePDF} disabled={isPending} className="text-parchment-400 hover:text-red-500 transition-colors" title="Remove PDF">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          ) : isAdmin ? (
            showUploader ? (
              <div className="w-full mt-2">
                <PDFUploader aliyahId={aliyah.id} onComplete={() => setShowUploader(false)} onCancel={() => setShowUploader(false)} />
              </div>
            ) : (
              <button onClick={() => setShowUploader(true)} disabled={isPending} title={isHe ? 'העלה PDF' : 'Upload PDF'} className="flex items-center gap-1 text-xs text-ink-400 hover:text-sage-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-hebrew">PDF</span>
              </button>
            )
          ) : null}
        </div>
      </div>

      {pdfModal}
    </div>
  );

  return (
    <>
      {mobileCard}
      {desktopCard}
    </>
  );
}
