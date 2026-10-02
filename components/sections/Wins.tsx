import type { Content } from '@/lib/site/content';

// Celebrating members' wins: three plain ways it happens today, no feature that does not exist yet.
export default function Wins({ c }: { c: Content }) {
  const WINS = c.wins;
  return (
    <section id="wins" className="section on-light" aria-labelledby="wins-title">
      <div className="wrap">
        <div className="split split--wins">
          <div className="wins__head reveal">
            <p className="label">{WINS.label}</p>
            <h2 id="wins-title">{WINS.h2}</h2>
            <p className="lede">{WINS.lede}</p>
          </div>
          <ol className="wins__list">
            {WINS.moments.map((m, i) => (
              <li key={m.title} className="win reveal" style={{ '--d': `${i * 110}ms` } as React.CSSProperties}>
                <span className="win__node" aria-hidden="true" />
                <p className="win__kicker">{m.kicker}</p>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="display wins__closing reveal">{WINS.closing}</p>
      </div>
    </section>
  );
}
