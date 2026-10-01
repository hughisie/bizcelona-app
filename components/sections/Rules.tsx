const RULES = [
  {
    title: 'Give Before You Take',
    body: 'Share your knowledge, make introductions and offer help before you seek it yourself. Members who give freely are the ones who gain most.',
  },
  {
    title: 'Active Participation',
    body: 'Remain part of the conversation. Read the group, respond with care, and get in touch when you notice somebody who needs what you know. A membership that stays passive weakens what we are building.',
  },
  {
    title: 'Mutual Respect and Trust',
    body: 'Be professional and courteous, honour your commitments and assume good intent. What we are building is long-term relationships, not transactions.',
  },
  {
    title: 'No Unsolicited Private Messages',
    body: 'Ask in the group first, or already have a relationship with the person, before you send a private message. Cold outreach and sales pitches destroy trust. Introduce yourself in the group and let things develop from there.',
  },
  {
    title: 'No Promotional Posts',
    body: 'This is not a marketing channel. No hard selling, no adverts in disguise. If your work is relevant to a conversation, mention it naturally. Unsure? Check with an admin first. Those who repeatedly ignore this are removed.',
  },
  {
    title: 'Privacy and Confidentiality',
    body: 'Do not screenshot, share or republish anything from the group without permission. Treat whatever members tell you as confidential. Breaches are treated seriously.',
  },
  {
    title: 'Tiered Involvement',
    body: 'Not everyone takes part to the same degree, and that is fine. But everyone abides by these rules and contributes something when they do take part. If you are seldom around, ask yourself whether this is the right fit. What we want is mutual growth, not passive consumption.',
  },
];

export default function Rules() {
  return (
    <section id="rules" className="section section--rule on-navy" aria-labelledby="rules-title">
      <div className="wrap">
        <div className="split split--rules">
          <div className="rules__intro reveal">
            <p className="label">House rules</p>
            <h2 id="rules-title">
              What&rsquo;s shared in Bizcelona <span className="accent">stays in Bizcelona.</span>
            </h2>
            <p className="muted measure">Seven rules. They are brief because we trust you to exercise judgement.</p>
          </div>
          <ol className="rules-list">
            {RULES.map((r) => (
              <li key={r.title} className="reveal">
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
