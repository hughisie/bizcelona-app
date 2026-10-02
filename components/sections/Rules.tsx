import { RULES } from '@/app/(site)/_content/content';

export default function Rules() {
  return (
    <section id="rules" className="section section--rule on-navy" aria-labelledby="rules-title">
      <div className="wrap">
        <div className="split split--rules">
          <div className="rules__intro reveal">
            <p className="label">{RULES.label}</p>
            <h2 id="rules-title">
              {RULES.h2Lead} <span className="accent">{RULES.h2Accent}</span>
            </h2>
            <p className="muted measure">{RULES.intro}</p>
          </div>
          <ol className="rules-list">
            {RULES.items.map((r) => (
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
