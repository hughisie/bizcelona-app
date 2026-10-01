const RUNGS = [
  { name: 'Member', body: 'Approved, profile complete, two skills listed.' },
  { name: 'Core member', body: '30 points in the last 90 days.' },
  { name: 'Host', body: 'Runs events and co-working days, by invitation.' },
  { name: 'Council', body: 'The seven senior volunteers who run Bizcelona.' },
];

export default function Ladder() {
  return (
    <section id="ladder" className="section section--mist on-light" aria-labelledby="ladder-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">The ladder</p>
          <h2 id="ladder-title">One rung at a time. Earned by helping.</h2>
          <p className="muted measure">
            <span className="tag-proposed">Proposed</span>
            A ladder of contribution, not a hierarchy of status. Anyone can move up by helping. These levels go
            to the council for review.
          </p>
        </div>
        <ol className="ladder">
          {RUNGS.map((r, i) => (
            <li
              key={r.name}
              className="rung reveal"
              style={{ '--d': `${i * 120}ms`, '--rise': i } as React.CSSProperties}
            >
              <span className="label">Rung {i + 1}</span>
              <h3>{r.name}</h3>
              <p>{r.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
