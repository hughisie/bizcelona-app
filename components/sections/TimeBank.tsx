const STEPS = [
  {
    title: 'Search',
    body: 'Find the skill you need and see who can help, with their response time and the hours they have given.',
  },
  {
    title: 'Ask',
    body: 'Say what you need in one or two lines. Asking is free.',
    free: true,
  },
  {
    title: 'Introduce',
    body: 'We send a WhatsApp introduction to you both, with the context, so nobody starts cold.',
  },
  {
    title: '24-hour check',
    body: 'A day later we ask whether you spoke, how useful it was and roughly how much time it took. The helper confirms you got in touch.',
  },
];

export default function TimeBank() {
  return (
    <section id="time-bank" className="section on-navy" aria-labelledby="timebank-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">How members help each other</p>
          <h2 id="timebank-title">The time bank, in four steps.</h2>
          <p className="lede muted">
            Search for the skill you need, ask in a line or two, and we introduce you on WhatsApp with context.
          </p>
        </div>

        <div className="steps-wrap">
          <span className="steps__line reveal" aria-hidden="true" />
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step reveal" style={{ '--d': `${i * 140}ms` } as React.CSSProperties}>
                <span className="step__num" aria-hidden="true">{i + 1}</span>
                <h3>
                  {s.title}
                  {s.free && <span className="tag-free">Free</span>}
                </h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="note reveal">
          The time bank is <strong>rolling out to members as part of the relaunch.</strong>
        </p>
      </div>
    </section>
  );
}
