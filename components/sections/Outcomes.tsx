import { OUTCOMES } from '@/app/(site)/_content/content';

export default function Outcomes() {
  return (
    <section id="outcomes" className="section section--mist on-light" aria-labelledby="outcomes-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">{OUTCOMES.label}</p>
          <h2 id="outcomes-title">{OUTCOMES.h2}</h2>
          <p className="lede">{OUTCOMES.lede}</p>
        </div>
        <ul className="outcomes">
          {OUTCOMES.items.map((o, i) => (
            <li key={o.title} className="outcome reveal" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="outcome__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
