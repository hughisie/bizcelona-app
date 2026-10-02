import type { Content } from '@/lib/site/content';

export default function Partnerships({ c }: { c: Content }) {
  const PARTNERS = c.partners;
  return (
    <section id="partnerships" className="section on-light" aria-labelledby="partners-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">{PARTNERS.label}</p>
          <h2 id="partners-title">{PARTNERS.h2Lead} <mark>{PARTNERS.h2Mark}</mark></h2>
          <p className="lede">{PARTNERS.lede}</p>
        </div>
        <div className="measure reveal">
          <p>{PARTNERS.para}</p>
        </div>
        <div className="panels">
          {PARTNERS.panels.map((p, i) => (
            <div key={p.title} className="panel reveal" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
        <div className="btn-row reveal">
          <a className="btn btn--navy" href={`mailto:hello@bizcelona.com?subject=${encodeURIComponent(PARTNERS.mailSubject)}`}>
            {PARTNERS.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
