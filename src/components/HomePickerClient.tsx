'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const GOLD   = '#c8a850';
const DARK   = '#0d1b2a';
const CREAM  = '#f8f2e3';
const BORDER = '#d4b88a';

const SEFARIM = [
  { he: 'בְּרֵאשִׁית', en: 'Bereishit', minOrder: 1,  maxOrder: 12 },
  { he: 'שְׁמוֹת',    en: 'Shemot',    minOrder: 13, maxOrder: 23 },
  { he: 'וַיִּקְרָא',  en: 'Vayikra',  minOrder: 24, maxOrder: 33 },
  { he: 'בְּמִדְבַּר', en: 'Bamidbar', minOrder: 34, maxOrder: 43 },
  { he: 'דְּבָרִים',  en: 'Devarim',  minOrder: 44, maxOrder: 54 },
];

const ALIYOT = [
  { he: 'כֹּהֵן',    en: '' },
  { he: 'לֵוִי',     en: '' },
  { he: 'שְׁלִישִׁי', en: '' },
  { he: 'רְבִיעִי',  en: '' },
  { he: 'חֲמִישִׁי', en: '' },
  { he: 'שִׁשִּׁי',  en: '' },
  { he: 'שְׁבִיעִי', en: '' },
];

interface Aliyah { id: string; number: number; done: boolean; }
interface Parsha { id: string; name: string; englishName: string; order: number; aliyos: Aliyah[]; }

interface Props {
  parshiyot: Parsha[];
  initialParshaId: string;
  initialAliyahIndex: number;
  hebrewYear: number;
}

export function HomePickerClient({ parshiyot, initialParshaId, initialAliyahIndex, hebrewYear }: Props) {
  const router = useRouter();

  const initParsha = parshiyot.find(p => p.id === initialParshaId) ?? parshiyot[0];
  const initSefer  = SEFARIM.findIndex(s => initParsha.order >= s.minOrder && initParsha.order <= s.maxOrder);

  const [seferIdx,  setSeferIdx]  = useState(Math.max(0, initSefer));
  const [parshaId,  setParshaId]  = useState(initParsha.id);
  const [aliyahIdx, setAliyahIdx] = useState(initialAliyahIndex);
  const [checked,   setChecked]   = useState<boolean[]>(() => initParsha.aliyos.map(a => a.done));

  const currentParsha  = parshiyot.find(p => p.id === parshaId) ?? parshiyot[0];
  const parshotInSefer = parshiyot.filter(p => p.order >= SEFARIM[seferIdx].minOrder && p.order <= SEFARIM[seferIdx].maxOrder);

  useEffect(() => {
    setChecked(currentParsha.aliyos.map(a => a.done));
  }, [parshaId]);

  const toggleDot = (i: number) =>
    setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; });

  const handleGo = () => {
    const aliyah = currentParsha.aliyos[aliyahIdx];
    if (!aliyah) return;
    router.push(`/aliyah/${aliyah.id}?year=${hebrewYear}`);
  };

  return (
    <div className="flex flex-col" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: DARK }}>

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-6 pb-4 flex items-center justify-center" style={{ background: DARK }}>
        <span className="font-hebrew font-bold text-center" style={{ fontSize: '34px', color: GOLD, direction: 'rtl', letterSpacing: '0.02em' }}>
          שניים מקרא
        </span>
      </div>

      {/* Card — fills space between header and bottom nav */}
      <div className="flex-1 min-h-0 px-4 pb-4" style={{ paddingBottom: '80px' }}>
      <div className="h-full flex flex-col py-5 px-5" style={{ background: CREAM, borderRadius: '20px', border: `1px solid ${BORDER}` }}>

        <div className="flex flex-col justify-between h-full">
        <SliderRow
          label="Sefer"
          items={SEFARIM.map(s => ({ he: s.he, en: s.en }))}
          selectedIdx={seferIdx}
          itemW={88}
          onSelect={idx => {
            setSeferIdx(idx);
            const first = parshiyot.find(p => p.order >= SEFARIM[idx].minOrder && p.order <= SEFARIM[idx].maxOrder);
            if (first) { setParshaId(first.id); setAliyahIdx(0); }
          }}
        />


        <SliderRow
          label="Parsha"
          items={parshotInSefer.map(p => ({ he: p.name, en: p.englishName }))}
          selectedIdx={parshotInSefer.findIndex(p => p.id === parshaId)}
          itemW={118}
          onSelect={idx => {
            const p = parshotInSefer[idx];
            if (p) { setParshaId(p.id); setAliyahIdx(0); }
          }}
        />


        <SliderRow
          label="Aliyah"
          items={ALIYOT}
          selectedIdx={aliyahIdx}
          itemW={88}
          onSelect={idx => setAliyahIdx(idx)}
          checked={checked}
          onDotClick={toggleDot}
        />

        {/* Ornamental divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <span style={{ color: GOLD, fontSize: '14px' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
        </div>

        {/* Summary */}
        <div className="text-center font-hebrew" style={{ fontSize: '16px', color: '#3a2e1e', direction: 'rtl' }}>
          {currentParsha.name}&nbsp;&nbsp;•&nbsp;&nbsp;{ALIYOT[aliyahIdx].he}
        </div>

        {/* GO button */}
        <button
          onClick={handleGo}
          className="w-full flex items-center justify-center gap-2 font-bold tracking-widest transition-opacity active:opacity-80"
          style={{ height: '56px', background: DARK, borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '16px', color: GOLD, letterSpacing: '0.15em' }}
        >
          GO
          <span style={{ fontSize: '18px', color: GOLD }}>›</span>
        </button>
        </div>
      </div>
      </div>

      <BottomNav />
    </div>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: '/home_beta',
      label: 'Home',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'none' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/',
      label: 'Progress',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch" style={{ background: DARK, height: '64px' }}>
      <div className="max-w-lg mx-auto w-full flex items-stretch">
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              style={{ color: active ? GOLD : '#6b7280' }}
            >
              {icon(active)}
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: active ? GOLD : '#6b7280' }}>
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5" style={{ background: GOLD }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Slider sub-component ──────────────────────────────────────────────────────
interface SliderItem { he: string; en: string; }

function SliderRow({ label, items, selectedIdx, itemW, onSelect, checked, onDotClick }: {
  label: string;
  items: SliderItem[];
  selectedIdx: number;
  itemW: number;
  onSelect: (idx: number) => void;
  checked?: boolean[];
  onDotClick?: (i: number) => void;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ pos: selectedIdx, vel: 0, animId: 0, active: false, startX: 0, startPos: 0, lastX: 0, lastT: 0 });
  const N = items.length;

  const itemPos  = (i: number) => (N - 1 - i) * itemW;
  const offsetFor = (idx: number) => {
    const cw = outerRef.current?.offsetWidth ?? 400;
    return cw / 2 - itemPos(idx) - itemW / 2;
  };
  const clamp = (offset: number) => {
    const a = offsetFor(0), b = offsetFor(N - 1);
    return Math.max(Math.min(a, b), Math.min(Math.max(a, b), offset));
  };
  const snapIdx = (offset: number) => {
    const cw = outerRef.current?.offsetWidth ?? 400;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(offset + itemPos(i) + itemW / 2 - cw / 2);
      if (d < bestD) { best = i; bestD = d; }
    }
    return best;
  };
  const styleItems = (offset: number) => {
    const track = trackRef.current; if (!track) return;
    const cw = outerRef.current?.offsetWidth ?? 400;
    const center = cw / 2;
    Array.from(track.children).forEach((el, i) => {
      const itemCenter = offset + itemPos(i) + itemW / 2;
      const t = Math.min(1, Math.abs(itemCenter - center) / (itemW * 2));
      (el as HTMLElement).style.transform = `scale(${1 - t * 0.28})`;
      (el as HTMLElement).style.opacity   = String(Math.max(0.18, 1 - t * 0.75));
      const heEl = (el as HTMLElement).querySelector('.he') as HTMLElement | null;
      if (heEl) heEl.style.color = t < 0.15 ? '#1a1208' : `rgba(26,18,8,${Math.max(0.25, 1 - t * 0.75)})`;
    });
  };
  const applyOffset = (offset: number, animate: boolean) => {
    const s = stateRef.current;
    if (s.animId) cancelAnimationFrame(s.animId);
    const track = trackRef.current; if (!track) return;
    const current = () => {
      const m = track.style.transform.match(/translateX\(([^p]+)px\)/);
      return m ? parseFloat(m[1]) : offsetFor(s.pos);
    };
    if (animate) {
      const from = current(), delta = offset - from;
      const dur = Math.min(400, Math.max(120, Math.abs(delta) * 0.6));
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const x = from + delta * ease(t);
        track.style.transform = `translateX(${x}px)`;
        styleItems(x);
        if (t < 1) { s.animId = requestAnimationFrame(tick); }
        else { track.style.transform = `translateX(${offset}px)`; styleItems(offset); }
      };
      s.animId = requestAnimationFrame(tick);
    } else {
      track.style.transform = `translateX(${offset}px)`;
      styleItems(offset);
    }
  };

  useEffect(() => {
    stateRef.current.pos = selectedIdx;
    applyOffset(offsetFor(selectedIdx), true);
  }, [selectedIdx, items.length]);

  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    track.style.width = `${N * itemW}px`;
    applyOffset(offsetFor(selectedIdx), false);
  }, [items.length]);

  useEffect(() => {
    const outer = outerRef.current; if (!outer) return;
    const s = stateRef.current;

    const begin = (x: number) => {
      if (s.animId) cancelAnimationFrame(s.animId);
      const m = trackRef.current?.style.transform.match(/translateX\(([^p]+)px\)/);
      s.startPos = m ? parseFloat(m[1]) : offsetFor(s.pos);
      s.startX = x; s.lastX = x; s.lastT = performance.now(); s.vel = 0; s.active = true;
    };
    const move = (x: number) => {
      if (!s.active) return;
      const clamped = clamp(s.startPos + (x - s.startX));
      if (trackRef.current) { trackRef.current.style.transform = `translateX(${clamped}px)`; styleItems(clamped); }
      const now = performance.now(), dt = now - s.lastT;
      if (dt > 0) s.vel = (x - s.lastX) / dt;
      s.lastX = x; s.lastT = now;
    };
    const end = () => {
      if (!s.active) return; s.active = false;
      const m = trackRef.current?.style.transform.match(/translateX\(([^p]+)px\)/);
      const cur = m ? parseFloat(m[1]) : offsetFor(s.pos);
      const proj = clamp(cur + s.vel * 160);
      const idx = snapIdx(proj);
      s.pos = idx;
      applyOffset(offsetFor(idx), true);
      onSelect(idx);
    };

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-dot]')) return;
      e.preventDefault();
      begin(e.clientX);
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('[data-dot]')) return;
      begin(e.touches[0].clientX);
    };
    const onTouchMove  = (e: TouchEvent) => move(e.touches[0].clientX);

    outer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);
    outer.addEventListener('touchstart', onTouchStart, { passive: true });
    outer.addEventListener('touchmove',  onTouchMove,  { passive: true });
    outer.addEventListener('touchend',   end);
    return () => {
      outer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
      outer.removeEventListener('touchstart', onTouchStart);
      outer.removeEventListener('touchmove',  onTouchMove);
      outer.removeEventListener('touchend',   end);
    };
  }, [N, itemW]);

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span style={{ color: GOLD, fontSize: '11px' }}>◇</span>
        <span className="font-semibold tracking-widest uppercase" style={{ color: GOLD, fontSize: '11px', letterSpacing: '0.18em' }}>{label}</span>
        <span style={{ color: GOLD, fontSize: '11px' }}>◇</span>
      </div>

      {/* Slider */}
      <div ref={outerRef} className="relative h-[80px] overflow-hidden cursor-grab active:cursor-grabbing" style={{ background: CREAM, borderRadius: '14px', border: `1px solid ${BORDER}` }}>
        {/* Triangles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `9px solid ${GOLD}` }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: `9px solid ${GOLD}` }} />
        {/* Fades */}
        <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${CREAM} 5%, transparent)` }} />
        <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${CREAM} 5%, transparent)` }} />
        {/* Track */}
        <div ref={trackRef} className="absolute top-0 h-full" style={{ width: `${N * itemW}px` }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex flex-col items-center justify-center"
              style={{ left: `${itemPos(i)}px`, width: `${itemW}px`, gap: '3px' }}
            >
              <span className="he font-hebrew font-bold leading-tight whitespace-nowrap" style={{ fontSize: '22px' }}>{item.he}</span>
              {item.en ? (
                <span className="font-semibold uppercase whitespace-nowrap" style={{ fontSize: '8px', color: '#a89060', letterSpacing: '0.1em' }}>{item.en}</span>
              ) : (
                <button
                  data-dot=""
                  onClick={e => { e.stopPropagation(); onDotClick?.(i); }}
                  style={{
                    width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                    border: checked?.[i] ? `1.5px solid ${GOLD}` : '1.5px solid #c4b49a',
                    background: checked?.[i] ? GOLD : 'white',
                    transition: 'background .15s, border-color .15s',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
