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
              Concentrated work at a partner venue that rotates. Then five minutes per person around the table: what you do, plus one problem you would welcome help with. Lunch is eaten together.
            </p>
          </article>
          <article className="card reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="label">Once a month</p>
            <h3>One quality event</h3>
            <p>
              Small and hands-on, for example a session on AI for beginners. One solid event each month, rather than a diary packed with mixers.
            </p>
          </article>
        </div>
        <p className="muted reveal rhythm__note">
          Once dates are confirmed, they appear on the <Link className="link-plain" href="/events/public">events page</Link>.
        </p>
      </div>
    </section>
  );
}
