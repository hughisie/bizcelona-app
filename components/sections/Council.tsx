const AREAS = [
  'Chair and coordination',
  'Platform and time bank',
  'Member success',
  'Events and co-working',
  'AI education',
  'Partnerships and perks',
  'Marketing and brand',
  'Finance and paid membership',
];

export default function Council() {
  return (
    <section id="council" className="section on-navy" aria-labelledby="council-title">
      <div className="wrap">
        <div className="split split--council">
          <div className="reveal">
            <p className="label">Who runs it</p>
            <h2 id="council-title">Run by the people in it.</h2>
            <p className="lede">A council of seven senior volunteers runs Bizcelona.</p>
            <div className="measure stack muted">
              <p>
                Each of them looks after an area, and each commits to being in the room, because no-shows are the
                enemy of trust. If someone is overloaded they say so early: a handover is fine, silence is not.
              </p>
              <p>
                <span className="tag-proposed">Proposed</span>
                Inside their own area, a council member decides. Money, membership rules and brand go to the
                whole council.
              </p>
            </div>
          </div>
          <div className="reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="label label--quiet">What the council looks after</p>
            <ul className="areas">
              {AREAS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
