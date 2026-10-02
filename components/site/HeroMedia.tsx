'use client';

import { useEffect, useRef } from 'react';

// The footage never competes with the headline. The poster (a normal image in the server HTML) is what
// loads first. Only after the page has finished loading, and the browser is idle, is a <video> added on top.
// It is skipped entirely when the visitor asks for reduced motion, has Save-Data on, or is on a slow connection.
export default function HeroMedia() {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const host = holder.current;
    if (!host) return;
    if (root.classList.contains('lite')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let video: HTMLVideoElement | null = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      // 1080p only for large, sharp screens. Phones and laptops get 720p, which is 1.4 MB.
      const wide = window.innerWidth * (window.devicePixelRatio || 1) >= 1900 && window.innerWidth >= 1100;
      const h = wide ? '1080' : '720';
      video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-hidden', 'true');
      video.tabIndex = -1;
      video.className = 'hero__video';
      for (const [type, ext] of [['video/webm; codecs="vp9"', 'webm'], ['video/mp4', 'mp4']] as const) {
        const s = document.createElement('source');
        s.src = `/media/hero-${h}.${ext}`;
        s.type = type;
        video.appendChild(s);
      }
      video.addEventListener('playing', () => video && video.classList.add('is-playing'), { once: true });
      host.appendChild(video);
      video.play().catch(() => { /* autoplay refused: the poster stays, which is fine */ });

      // Pause when the hero is off screen, so it costs nothing further down the page.
      io = new IntersectionObserver(([e]) => {
        if (!video) return;
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
      io.observe(host);
    };

    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const kick = () => (idle ? idle(start, { timeout: 1500 }) : window.setTimeout(start, 250));
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick, { once: true });

    return () => {
      cancelled = true;
      io?.disconnect();
      video?.pause();
      video?.remove();
    };
  }, []);

  return <div ref={holder} className="hero__media-slot" aria-hidden="true" />;
}
