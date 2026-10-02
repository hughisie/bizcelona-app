import Picture from '@/components/site/Picture';
import { ABOUT } from '@/app/(site)/_content/content';

export default function About() {
  return (
    <section id="about" className="section on-light" aria-labelledby="about-title">
      <div className="wrap">
        <div className="split split--about">
          <div className="reveal">
            <p className="label">{ABOUT.label}</p>
            <h2 id="about-title">{ABOUT.h2}</h2>
            <p className="lede">{ABOUT.lede}</p>
            <div className="measure stack">
              {ABOUT.paras.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            </div>
            <ul className="not-list measure" aria-label="What Bizcelona is not">
              {ABOUT.notList.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
          <figure className="figure reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="par par--tall">
              <Picture
                name="eixample"
                sizes={[640, 1100]}
                sizesAttr="(min-width: 64em) 36vw, 100vw"
                width={1100}
                height={825}
                alt={ABOUT.photoAlt}
                lazy
              />
            </div>
            <figcaption>{ABOUT.photoCaption}</figcaption>
          </figure>
        </div>

        <div className="bet reveal">
          <p className="label">{ABOUT.whyNowLabel}</p>
          <p className="display bet__line">{ABOUT.whyNow}</p>
        </div>
      </div>
    </section>
  );
}
