'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Fallback only. Browsers with CSS scroll-driven animation (Chrome, Edge, Safari 26) need no JavaScript for the
// hero dissolve or the pinned time bank: CSS does it. For the rest (Firefox today) this watches a few invisible
// markers and sets data-phase / data-step on the section, and CSS eases between the steps instead of scrubbing.
export default function SceneController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('io') || !root.classList.contains('fx')) return;

    const groups = new Map<HTMLElement, { attr: string; base: number; marks: HTMLElement[] }>();
    document.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene) => {
      const marks = Array.from(scene.querySelectorAll<HTMLElement>('[data-mark]'));
      groups.set(scene, { attr: scene.dataset.scene!, base: Number(scene.dataset.base ?? 0), marks });
    });
    if (!groups.size) return;

    const update = () => {
      const line = window.innerHeight * 0.55;
      groups.forEach((g, scene) => {
        const passed = g.marks.filter((m) => m.getBoundingClientRect().top < line).length;
        scene.setAttribute(`data-${g.attr}`, String(g.base + passed));
      });
    };

    const io = new IntersectionObserver(update, { rootMargin: '0px 0px -45% 0px' });
    groups.forEach((g) => g.marks.forEach((m) => io.observe(m)));
    update();
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
