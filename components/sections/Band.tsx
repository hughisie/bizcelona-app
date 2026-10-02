import LazyClip from '@/components/site/LazyClip';
import type { Content } from '@/lib/site/content';

// Owen's drone footage over the rooftops towards the sea, with his reason for starting this. Footage loads only when near the screen.
export default function Band({ c }: { c: Content }) {
  const BAND = c.band;
  return (
    <section className="band on-navy" aria-labelledby="band-title">
      <div className="band__photo" aria-hidden="true">
        <picture>
          <source type="image/avif" srcSet="/media/band-rooftops-poster.avif" />
          <img src="/media/band-rooftops-poster.webp" alt="" width={960} height={540} loading="lazy" decoding="async" />
        </picture>
        <LazyClip name="band-rooftops" />
      </div>
      <div className="band__veil" aria-hidden="true" />
      <div className="wrap band__inner">
        <figure className="reveal">
          <p className="label label--quiet" id="band-title">{BAND.label}</p>
          <blockquote>
            <p className="display">{BAND.quote}</p>
          </blockquote>
          <figcaption>{BAND.cite}</figcaption>
        </figure>
      </div>
    </section>
  );
}
