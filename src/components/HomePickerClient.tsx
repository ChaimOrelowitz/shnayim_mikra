'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4" style={{ background: '#0a1628' }}>
      {/* Top bar */}
      <div className="w-full max-w-[440px] px-5 py-3.5 flex items-center justify-between" style={{ background: '#1e3a8a', borderRadius: '20px 20px 0 0' }}>
        <span className="font-hebrew text-lg font-bold text-white" style={{ direction: 'rtl' }}>שניים מקרא</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
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
    </div>
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
