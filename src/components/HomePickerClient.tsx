'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const SEFARIM = [
  { he: 'בְּרֵאשִׁית', en: 'Bereishit', minOrder: 1,  maxOrder: 12  },
  { he: 'שְׁמוֹת',    en: 'Shemot',    minOrder: 13, maxOrder: 23  },
  { he: 'וַיִּקְרָא',  en: 'Vayikra',  minOrder: 24, maxOrder: 33  },
  { he: 'בְּמִדְבַּר', en: 'Bamidbar', minOrder: 34, maxOrder: 43  },
  { he: 'דְּבָרִים',  en: 'Devarim',  minOrder: 44, maxOrder: 54  },
];

const ALIYOT_HE = ['כֹּהֵן','לֵוִי','שְׁלִישִׁי','רְבִיעִי','חֲמִישִׁי','שִׁשִּׁי','שְׁבִיעִי'];

interface Aliyah  { id: string; number: number; done: boolean; }
interface Parsha  { id: string; name: string; englishName: string; order: number; aliyos: Aliyah[]; }

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

  const handleGo = () => {
    const aliyah = currentParsha.aliyos[aliyahIdx];
    if (!aliyah) return;
    router.push(`/aliyah/${aliyah.id}?year=${hebrewYear}`);
  };

  const toggleDot = (i: number) =>
    setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 pb-24" style={{ background: '#0a1628' }}>
      {/* Top bar */}
      <div className="w-full max-w-[440px] px-5 py-3.5 flex items-center justify-center" style={{ background: '#1e3a8a', borderRadius: '20px 20px 0 0' }}>
        <span className="font-hebrew text-lg font-bold text-white" style={{ direction: 'rtl' }}>שניים מקרא</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-white flex flex-col" style={{ borderRadius: '0 0 24px 24px', paddingTop: '28px', paddingBottom: '28px' }}>

        <div className="px-5 mb-[18px]">
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
        </div>

        <div className="px-5 mb-[18px]">
          <SliderRow
            label="Parsha"
            items={parshotInSefer.map(p => ({ he: p.name, en: p.englishName }))}
            selectedIdx={parshotInSefer.findIndex(p => p.id === parshaId)}
            itemW={110}
            onSelect={idx => {
              const p = parshotInSefer[idx];
              if (p) { setParshaId(p.id); setAliyahIdx(0); }
            }}
          />
        </div>

        <div className="px-5 mb-[18px]">
          <SliderRow
            label="Aliyah"
            items={ALIYOT_HE.map(he => ({ he, en: '' }))}
            selectedIdx={aliyahIdx}
            itemW={80}
            onSelect={idx => setAliyahIdx(idx)}
            checked={checked}
            onDotClick={toggleDot}
          />
        </div>

        <div className="mx-5 mb-4" style={{ height: '1px', background: '#f0e8d8', marginTop: '4px' }} />

        <div className="text-center font-hebrew px-5 mb-[14px]" style={{ fontSize: '15px', color: '#475569', direction: 'rtl', minHeight: '20px' }}>
          {currentParsha.name}&nbsp;&nbsp;·&nbsp;&nbsp;{ALIYOT_HE[aliyahIdx]}
        </div>

        <button
          onClick={handleGo}
          className="mx-5 flex items-center justify-center gap-2 font-bold text-sm tracking-wider text-white transition-transform active:scale-[.98]"
          style={{ height: '52px', background: '#1e3a8a', borderRadius: '13px', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1e3a8a')}
        >
          GO
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/',
      label: 'Tracker',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
      <div className="max-w-lg mx-auto flex items-stretch h-16">
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {icon(active)}
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-blue-700' : 'text-gray-400'}`}>
                {label}
              </span>
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

  const itemPos = (i: number) => (N - 1 - i) * itemW;
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
      (el as HTMLElement).style.transform = `scale(${1 - t * 0.3})`;
      (el as HTMLElement).style.opacity   = String(Math.max(0.15, 1 - t * 0.72));
      const g = Math.round(17 + t * 162).toString(16).padStart(2, '0');
      const heEl = (el as HTMLElement).querySelector('.he') as HTMLElement | null;
      if (heEl) heEl.style.color = `#${g}${g}${g}`;
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
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#94a3b8' }}>{label}</p>
      <div ref={outerRef} className="relative h-[72px] overflow-hidden cursor-grab active:cursor-grabbing" style={{ background: '#f9f6f1', borderRadius: '12px', border: '1px solid #e2d4be' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #1e3a8a' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '9px solid #1e3a8a' }} />
        <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #f9f6f1 5%, transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #f9f6f1 5%, transparent)' }} />
        <div ref={trackRef} className="absolute top-0 h-full" style={{ width: `${N * itemW}px` }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex flex-col items-center justify-center"
              style={{ left: `${itemPos(i)}px`, width: `${itemW}px`, gap: '3px' }}
            >
              <span className="he font-hebrew font-bold leading-tight whitespace-nowrap" style={{ fontSize: '21px' }}>{item.he}</span>
              {item.en ? (
                <span className="font-semibold tracking-wide uppercase whitespace-nowrap" style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.07em' }}>{item.en}</span>
              ) : (
                <button
                  data-dot=""
                  onClick={e => { e.stopPropagation(); onDotClick?.(i); }}
                  style={{
                    width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                    border: checked?.[i] ? '1.5px solid #1e3a8a' : '1.5px solid #c4b49a',
                    background: checked?.[i] ? '#1e3a8a' : 'white',
                    cursor: 'pointer', transition: 'background .15s, border-color .15s',
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
