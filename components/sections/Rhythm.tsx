import Link from 'next/link';

export default function Rhythm() {
  return (
    <section id="rhythm" className="section on-light" aria-labelledby="rhythm-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">Show up</p>
          <h2 id="rhythm-title">A steady rhythm, so people actually meet.</h2>
        </div>
        <div className="cards cards--two">
          <article className="card reveal">
            <p className="label">Every two weeks</p>
            <h3>Co-working day</h3>
            <p>
              Focused work at a rotating partner space. Then five minutes each round the table: what you do and
              one problem you would like help with. Lunch together.
            </p>
          </article>
          <article className="card reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="label">Once a month</p>
            <h3>One quality event</h3>
            <p>
              Small and practical, such as an AI for beginners session. One good event a month, rather than a
              calendar full of mixers.
            </p>
          </article>
        </div>
        <p className="muted reveal rhythm__note">
          Dates are on the <Link className="link-plain" href="/events/public">events page</Link> as soon as they are confirmed.
        </p>
      </div>
    </section>
  );
}
