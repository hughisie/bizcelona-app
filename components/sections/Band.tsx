import Picture from '@/components/site/Picture';
import { BAND } from '@/app/(site)/_content/content';

// A full-bleed photograph with Owen's reason for starting this, drifting slowly as you scroll past.
export default function Band() {
  return (
    <section className="band on-navy" aria-labelledby="band-title">
      <div className="band__photo par" aria-hidden="true">
        <Picture
          name="panorama"
          sizes={[800, 1600]}
          sizesAttr="100vw"
          width={1600}
          height={1200}
          alt=""
          lazy
        />
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
