import Link from 'next/link';
import { preload } from 'react-dom';
import HeroNetwork from '@/components/site/HeroNetwork';
import HeroMedia from '@/components/site/HeroMedia';
import Picture from '@/components/site/Picture';
import type { Content } from '@/lib/site/content';

// The signature: Owen's drone footage of Barcelona. As you scroll it darkens and dissolves into the Eixample
// street grid, and the saffron lines draw between the blocks. The real city becomes the network.
// Without scroll effects (reduced motion, Save-Data, no JavaScript) it is one calm picture: poster plus the finished grid.
export default function Hero({ c }: { c: Content }) {
  const HERO = c.hero;
  // Fetch the poster at high priority; it is small (36 KB on phones) and the footage itself waits until after load.
  preload('/media/hero-poster-960.avif', {
    as: 'image',
    type: 'image/avif',
    imageSrcSet: '/media/hero-poster-960.avif 960w, /media/hero-poster-1920.avif 1920w',
    imageSizes: '100vw',
    fetchPriority: 'high',
  });
  return (
    <section id="home" className="hero on-navy" aria-labelledby="hero-title" data-scene="phase" data-phase="0">
      <div className="hero__pin">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__media">
            <picture>
              <source type="image/avif" srcSet="/media/hero-poster-960.avif 960w, /media/hero-poster-1920.avif 1920w" sizes="100vw" />
              <source type="image/webp" srcSet="/media/hero-poster-960.webp 960w, /media/hero-poster-1920.webp 1920w" sizes="100vw" />
              <img
                className="hero__poster"
                src="/media/hero-poster-1920.webp"
                alt=""
                width={1920}
                height={1080}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            <HeroMedia />
          </div>
          <div className="hero__shade" />
          <HeroNetwork />
        </div>

        <div className="wrap hero__inner">
          <div className="hero__copy">
            <p className="label hero__label">{HERO.label}</p>
            <h1 id="hero-title">{HERO.h1}</h1>
            <p className="lede hero__lede">{HERO.lede}</p>
            <div className="btn-row hero__cta">
              <Link className="btn btn--saffron" href="/signup">{HERO.primary}</Link>
              <a className="btn btn--ghost" href="#time-bank">{HERO.secondary}</a>
            </div>
            <ul className="hero__facts" aria-label={c.ui.atAGlance}>
              {HERO.facts.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>

          <div className="hero__beat" aria-hidden="true">
            <p className="display hero__beat-line">{HERO.beat}</p>
            <p className="hero__beat-sub">{HERO.beatSub}</p>
            <Link className="btn btn--saffron" href="/signup" tabIndex={-1}>{HERO.primary}</Link>
          </div>
        </div>

        <p className="hero__scroll" aria-hidden="true"><span>{HERO.scroll}</span></p>
      </div>
      <span className="mark" data-mark style={{ top: 'calc(55svh + 26svh)' }} aria-hidden="true" />
      <span className="mark" data-mark style={{ top: 'calc(55svh + 95svh)' }} aria-hidden="true" />
    </section>
  );
}
