'use client';

import { useEffect } from 'react';

// Fades in elements marked `data-reveal` as they scroll into view.
// Content stays visible without JS: hiding only starts once <html> gets
// `data-reveal-ready`, and anything already on screen is shown first.
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const show = (el: Element) => el.setAttribute('data-revealed', '');

    for (const el of els) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
    }
    document.documentElement.setAttribute('data-reveal-ready', '');

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    els.forEach((el) => !el.hasAttribute('data-revealed') && io.observe(el));

    return () => {
      io.disconnect();
      document.documentElement.removeAttribute('data-reveal-ready');
    };
  }, []);

  return null;
}
