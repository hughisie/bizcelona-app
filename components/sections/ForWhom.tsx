import Link from 'next/link';
import { FOR_WHOM } from '@/app/(site)/_content/content';

export default function ForWhom() {
  return (
    <section id="who" className="section section--mist on-light" aria-labelledby="who-title">
      <div className="wrap">
        <div className="split split--who">
          <div className="reveal">
            <p className="label">{FOR_WHOM.label}</p>
            <h2 id="who-title">{FOR_WHOM.h2}</h2>
          </div>
          <div className="reveal" style={{ '--d': '100ms' } as React.CSSProperties}>
            <div className="measure stack stack--first">
              {FOR_WHOM.paras.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            </div>
            <ul className="chips" aria-label="Who we welcome">
              {FOR_WHOM.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <div className="btn-row">
              <Link className="btn btn--navy" href="/signup">{FOR_WHOM.cta}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
