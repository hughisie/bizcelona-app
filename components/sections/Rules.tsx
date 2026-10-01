const RULES = [
  {
    title: 'Give Before You Take',
    body: 'Share what you know, make introductions and lend a hand before you ask for help yourself. The members who give are the ones who gain most.',
  },
  {
    title: 'Active Participation',
    body: 'Stay in the conversation. Read the group, reply thoughtfully, and reach out when you spot someone who needs what you know. A passive membership dilutes what we are building.',
  },
  {
    title: 'Mutual Respect and Trust',
    body: 'Be professional and courteous, keep your commitments and assume good intent. We are building long-term relationships, not transactions.',
  },
  {
    title: 'No Unsolicited Private Messages',
    body: 'Ask in the group first, or have an existing relationship, before you message someone privately. Cold outreach and sales pitches break trust. Introduce yourself in the group and let it grow from there.',
  },
  {
    title: 'No Promotional Posts',
    body: 'This is not a marketing channel. No hard sells, no thinly disguised adverts. If your work is relevant to a conversation, say so naturally. Not sure? Ask an admin first. Repeat offenders are removed.',
  },
  {
    title: 'Privacy and Confidentiality',
    body: 'Do not screenshot, share or republish anything from the group without permission. Treat what members tell you as confidential. Breaches are taken seriously.',
  },
  {
    title: 'Tiered Involvement',
    body: 'Not everyone is active at the same level, and that is fine. But everyone follows these rules and adds value when they take part. If you are rarely around, ask yourself whether this is the right fit. We are after mutual growth, not passive consumption.',
  },
];

export default function Rules() {
  return (
    <section id="rules" className="section section--rule on-navy" aria-labelledby="rules-title">
      <div className="wrap">
        <div className="split split--rules">
          <div className="sticky reveal">
            <p className="label">House rules</p>
            <h2 id="rules-title">
              What&rsquo;s shared in Bizcelona <span className="accent">stays in Bizcelona.</span>
            </h2>
            <p className="muted measure">Seven rules. They are short because we expect you to use judgement.</p>
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
