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
  const [checked,   setChecked]   = useState<boolean[]>(() =>
    initParsha.aliyos.map(a => a.done)
  );

  const currentParsha = parshiyot.find(p => p.id === parshaId) ?? parshiyot[0];
  const parshotInSefer = parshiyot.filter(p => p.order >= SEFARIM[seferIdx].minOrder && p.order <= SEFARIM[seferIdx].maxOrder);

  // When sefer changes externally, update checked state
  useEffect(() => {
    setChecked(currentParsha.aliyos.map(a => a.done));
  }, [parshaId]);

  const handleGo = () => {
    const aliyah = currentParsha.aliyos[aliyahIdx];
    if (!aliyah) return;
    router.push(`/aliyah/${aliyah.id}?year=${hebrewYear}`);
  };

  return (
    <div className="min-h-screen bg-parchment-50 flex flex-col">
      {/* Page header */}
      <div className="page-container py-6 flex-1 flex flex-col gap-5 max-w-lg mx-auto w-full">
        <div className="mt-2">
          <h1 className="text-lg font-bold text-ink-900 font-hebrew">שניים מקרא</h1>
          <p className="text-xs text-ink-400 mt-0.5">What are you learning today?</p>
        </div>

        {/* Sefer slider */}
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

        {/* Parsha slider */}
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

        {/* Aliyah circles */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-ink-400 mb-2">Aliyah</p>
          <div className="flex justify-between px-1">
            {ALIYOT_HE.map((he, i) => (
              <button
                key={i}
                onClick={() => {
                  setAliyahIdx(i);
                  setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; });
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                  checked[i]
                    ? 'bg-blue-700 border-blue-700'
                    : aliyahIdx === i
                    ? 'border-blue-700 bg-white'
                    : 'border-parchment-300 bg-white'
                }`}>
                  {checked[i] && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-hebrew text-[11px] ${aliyahIdx === i ? 'text-blue-700 font-bold' : 'text-ink-400'}`}>
                  {he}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Go button */}
        <button
          onClick={handleGo}
          className="w-full h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold text-base tracking-wider transition-colors flex items-center justify-center gap-2 mt-auto"
        >
          Go
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Slider sub-component ──────────────────────────────────────────────────────
interface SliderItem { he: string; en: string; }

function SliderRow({ label, items, selectedIdx, itemW, onSelect }: {
  label: string;
  items: SliderItem[];
  selectedIdx: number;
  itemW: number;
  onSelect: (idx: number) => void;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ pos: selectedIdx, vel: 0, animId: 0, active: false, startX: 0, startPos: 0, lastX: 0, lastT: 0 });
  const N = items.length;

  const itemPos = (i: number) => (N - 1 - i) * itemW; // RTL
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
      ((el as HTMLElement).querySelector('.he') as HTMLElement).style.color = `#${g}${g}${g}`;
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

  // Sync when selectedIdx changes externally
  useEffect(() => {
    stateRef.current.pos = selectedIdx;
    applyOffset(offsetFor(selectedIdx), true);
  }, [selectedIdx, items.length]);

  // Re-init on mount / items change
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

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); begin(e.clientX); };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientX);
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
      <p className="text-[10px] font-semibold tracking-widest uppercase text-ink-400 mb-2">{label}</p>
      <div ref={outerRef} className="relative h-[72px] bg-parchment-50 rounded-xl border border-parchment-200 overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Triangle indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-blue-700 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-blue-700 pointer-events-none" />
        {/* Fades */}
        <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{background:'linear-gradient(to right,#faf8f3 10%,transparent)'}} />
        <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{background:'linear-gradient(to left,#faf8f3 10%,transparent)'}} />
        {/* Track */}
        <div ref={trackRef} className="absolute top-0 h-full" style={{ width: `${N * itemW}px` }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex flex-col items-center justify-center gap-0.5"
              style={{ left: `${itemPos(i)}px`, width: `${itemW}px` }}
            >
              <span className="he font-hebrew text-[1.25rem] font-bold leading-tight whitespace-nowrap">{item.he}</span>
              <span className="text-[9px] font-semibold tracking-wide uppercase text-ink-300 whitespace-nowrap">{item.en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
