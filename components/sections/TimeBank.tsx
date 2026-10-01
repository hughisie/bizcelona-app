const STEPS = [
  {
    title: 'Search',
    body: 'Track down the skill you are after and see who can help, along with how quickly they tend to reply and the hours they have given.',
  },
  {
    title: 'Ask',
    body: 'Set out your request in one or two lines. There is no charge for asking.',
    free: true,
  },
  {
    title: 'Introduce',
    body: 'We send both parties a WhatsApp introduction that includes the context, so neither side is starting from scratch.',
  },
  {
    title: '24-hour check',
    body: 'A day afterwards we check whether you made contact, how helpful it proved and approximately how long it took. The person who helped confirms that you were in touch.',
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
            Looking for a particular skill? Describe what you need in a line or two, and we will make an introduction on WhatsApp, giving both sides the context.
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
          The time bank is <strong>being introduced to members as part of the relaunch.</strong>
        </p>
      </div>
    </section>
  );
}
