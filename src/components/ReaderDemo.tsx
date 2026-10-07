'use client';

import { useState } from 'react';

// A working sample of the iOS reader (AliyahReaderView.PasukRow), built from
// the app's Theme.swift colors and its bundled corpus text. Visitors can flip
// light/dark, Rashi script/block letters, Rashi nikud, and the Rashi/English
// panels — the same choices the app offers.

const THEMES = {
  light: {
    bg: '#F2EAD0', text: '#1A2538', soft: 'rgba(26, 37, 56, 0.55)', accent: '#B89455',
    targum: '#264D9D', targumRule: 'rgba(38, 77, 157, 0.4)', surface: '#F0E6CC',
    border: 'rgba(26, 37, 56, 0.10)', onAccent: '#0A0E1A',
  },
  dark: {
    bg: '#0A0E1A', text: '#F2EAD0', soft: 'rgba(242, 234, 208, 0.55)', accent: '#D4A574',
    targum: '#7DA0E5', targumRule: 'rgba(125, 160, 229, 0.4)', surface: '#1B1F2D',
    border: 'rgba(212, 165, 116, 0.14)', onAccent: '#0A0E1A',
  },
} as const;

type Mode = keyof typeof THEMES;
type Panel = 'rashi' | 'english' | 'none';

// Same rule as the app's stripNikud(): drop U+05B0–U+05C7
const stripNikud = (s: string) => s.replace(/[ְ-ׇ]/g, '');

const LABEL_FONT = { fontFamily: 'var(--font-poppins), system-ui, sans-serif' };
// The app sets English in Apple's system serif; ui-serif is that font on Apple devices
const ENGLISH_FONT = { fontFamily: 'ui-serif, "New York", Georgia, serif' };

export interface ReaderDemoText {
  ref: string;
  mikra: string;
  targum: string;
  rashiDibbur: string;
  rashiText: string; // with nikud
  english: string;
}

function Segmented<T extends string>({
  label, value, options, onChange, disabled,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ opacity: disabled ? 0.45 : 1 }}>
      <span className="text-[10px] font-medium uppercase tracking-[0.28em]" style={{ ...LABEL_FONT, color: '#8E6E36' }}>
        {label}
      </span>
      <div className="flex rounded-full border p-1" style={{ borderColor: 'rgba(26, 37, 56, 0.14)' }} role="group" aria-label={label}>
        {options.map(([v, text]) => {
          const on = v === value;
          return (
            <button
              key={v}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              onClick={() => onChange(v)}
              className="rounded-full px-4 py-1.5 text-[13px] transition-colors duration-300"
              style={{ ...LABEL_FONT, background: on ? '#1A2538' : 'transparent', color: on ? '#F2EAD0' : 'rgba(26, 37, 56, 0.7)' }}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReaderDemo({ text }: { text: ReaderDemoText }) {
  const [mode, setMode] = useState<Mode>('light');
  const [script, setScript] = useState<'rashi' | 'block'>('rashi');
  const [nikud, setNikud] = useState<'off' | 'on'>('off');
  const [panel, setPanel] = useState<Panel>('rashi');

  const t = THEMES[mode];
  // As in the app: block letters always show nikud; Rashi script follows the toggle
  const nikudVisible = script === 'block' || nikud === 'on';
  const dibbur = nikudVisible ? text.rashiDibbur : stripNikud(text.rashiDibbur);
  const rashiBody = nikudVisible ? text.rashiText : stripNikud(text.rashiText);

  const panelButton = (which: Exclude<Panel, 'none'>, glyph: React.ReactNode, aria: string) => {
    const on = panel === which;
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={aria}
        onClick={() => setPanel(on ? 'none' : which)}
        className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full border transition-colors duration-300"
        style={{ background: on ? t.accent : t.surface, borderColor: `${t.accent}80`, color: on ? t.onAccent : t.soft }}
      >
        {glyph}
      </button>
    );
  };

  return (
    <div>
      {/* Controls */}
      <div className="mb-10 flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
        <Segmented label="Appearance" value={mode} onChange={setMode} options={[['light', 'Light'], ['dark', 'Dark']]} />
        <Segmented label="Rashi" value={script} onChange={setScript} options={[['rashi', 'Rashi script'], ['block', 'Block']]} />
        <Segmented
          label="Rashi nikud"
          value={script === 'block' ? 'on' : nikud}
          onChange={setNikud}
          options={[['off', 'Off'], ['on', 'On']]}
          disabled={script === 'block'}
        />
      </div>

      {/* Reader */}
      <figure
        className="mx-auto max-w-2xl overflow-hidden rounded-[1.75rem] border text-right transition-colors duration-500"
        style={{ background: t.bg, borderColor: t.border, color: t.text }}
      >
        <div className="flex justify-end px-6 pt-7 sm:px-8">
          <span
            className="rounded-full px-3 py-1 text-[12px] font-medium transition-colors duration-500"
            style={{ ...LABEL_FONT, background: t.accent, color: t.onAccent }}
            lang="he"
          >
            {text.ref}
          </span>
        </div>

        <div dir="rtl" lang="he" className="font-hebrew space-y-4 px-6 pt-4 pb-4 sm:px-8">
          <p className="text-[1.65rem] leading-[1.65] sm:text-[2.15rem]">{text.mikra}</p>
          <p className="text-[1.35rem] leading-[1.65] sm:text-[1.7rem]">{text.mikra}</p>
          <p className="flex items-stretch gap-3 text-[1.2rem] leading-[1.7] transition-colors duration-500 sm:text-[1.5rem]" style={{ color: t.targum }}>
            <span className="w-[2px] shrink-0" style={{ background: t.targumRule }} aria-hidden />
            <span>{text.targum}</span>
          </p>
        </div>

        {/* Hairline with the E and ר buttons sitting on it */}
        <div className="relative flex h-10 items-center justify-center">
          <span className="absolute inset-x-6 top-1/2 h-px sm:inset-x-8" style={{ background: `${t.accent}40` }} aria-hidden />
          <div className="relative flex gap-3">
            {panelButton('english', <span className="text-[14px] font-medium italic" style={ENGLISH_FONT}>E</span>, 'English translation')}
            {panelButton('rashi', <span className="font-rashi text-[15px]">ר</span>, 'Rashi')}
          </div>
        </div>

        <div className="transition-colors duration-500" style={{ background: panel === 'none' ? 'transparent' : t.surface }}>
          {panel === 'rashi' && (
            <p dir="rtl" lang="he" className="px-6 py-6 leading-[1.95] sm:px-8">
              <span className="font-hebrew font-bold" style={{ fontSize: script === 'rashi' ? '1.45rem' : '1.3rem' }}>
                {dibbur}
              </span>{' '}
              <span className={script === 'rashi' ? 'font-rashi' : 'font-hebrew'} style={{ fontSize: '1.2rem' }}>
                {rashiBody}
              </span>
            </p>
          )}
          {panel === 'english' && (
            <p dir="ltr" lang="en" className="px-6 py-6 text-left text-[1.15rem] leading-[1.7] sm:px-8" style={ENGLISH_FONT}>
              {text.english}
            </p>
          )}
          {panel === 'none' && <div className="h-4" />}
        </div>
      </figure>
    </div>
  );
}
