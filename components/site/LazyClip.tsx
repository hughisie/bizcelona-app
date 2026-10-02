'use client';

import { useEffect, useRef } from 'react';

// A short, muted, looping clip that only exists once it is near the screen. The poster is the server-rendered
// image underneath, so reduced-motion, Save-Data and slow-connection visitors see a still and download no video.
export default function LazyClip({ name }: { name: string }) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    if (document.documentElement.classList.contains('lite')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let video: HTMLVideoElement | null = null;

    const make = () => {
      video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.className = 'clip__video';
      video.setAttribute('aria-hidden', 'true');
      video.tabIndex = -1;
      for (const [type, ext] of [['video/webm; codecs="vp9"', 'webm'], ['video/mp4', 'mp4']] as const) {
        const s = document.createElement('source');
        s.src = `/media/${name}.${ext}`;
        s.type = type;
        video.appendChild(s);
      }
      video.addEventListener('playing', () => video && video.classList.add('is-playing'), { once: true });
      host.appendChild(video);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!video) make();
          video!.play().catch(() => {});
        } else {
          video?.pause();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(host);
    return () => {
      io.disconnect();
      video?.pause();
      video?.remove();
    };
  }, [name]);

  return <div ref={holder} className="clip__slot" aria-hidden="true" />;
}
