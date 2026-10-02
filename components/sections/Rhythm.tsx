import Link from 'next/link';
import LazyClip from '@/components/site/LazyClip';
import { RHYTHM } from '@/app/(site)/_content/content';

const CLIPS = ['clip-cowork', 'clip-evening'] as const;

export default function Rhythm() {
  return (
    <section id="rhythm" className="section on-light" aria-labelledby="rhythm-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">{RHYTHM.label}</p>
          <h2 id="rhythm-title">{RHYTHM.h2}</h2>
          <p className="lede">{RHYTHM.lede}</p>
        </div>
        <div className="cards cards--two">
          {RHYTHM.cards.map((c, i) => (
            <article key={c.title} className="moment reveal" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
              <div className="moment__media" role="img" aria-label={c.clipAlt}>
                <picture>
                  <source type="image/avif" srcSet={`/media/${CLIPS[i]}-poster.avif`} />
                  <img src={`/media/${CLIPS[i]}-poster.webp`} alt="" width={480} height={640} loading="lazy" decoding="async" />
                </picture>
                <LazyClip name={CLIPS[i]} />
              </div>
              <div className="moment__body">
                <p className="label">{c.kicker}</p>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="muted reveal rhythm__note">
          {RHYTHM.notePre}
          <Link className="link-plain" href="/events/public">{RHYTHM.noteLink}</Link>
          {RHYTHM.notePost}
        </p>
      </div>
    </section>
  );
}
