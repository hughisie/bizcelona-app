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
            <p className="lede">Seven senior volunteers make up the council that runs Bizcelona.</p>
            <div className="measure stack muted">
              <p>
                Every one of them is responsible for a particular area, and every one of them undertakes to be present, since failing to show up is what destroys trust. Anyone who is stretched too thin should speak up early: handing over is acceptable, staying silent is not.
              </p>
              <p>
                <span className="tag-proposed">Proposed</span>
                Within their own area, a council member decides. Matters of money, membership rules and brand are decided by the council as a whole.
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
