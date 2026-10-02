import type { Content } from '@/lib/site/content';

// Native <details>: keyboard and screen-reader friendly, works without JavaScript, and every answer is in the HTML.
export default function Faq({ c }: { c: Content }) {
  const FAQ = c.faq;
  return (
    <section id="faq" className="section section--mist on-light" aria-labelledby="faq-title">
      <div className="wrap">
        <div className="split split--faq">
          <div className="reveal">
            <p className="label">{FAQ.label}</p>
            <h2 id="faq-title">{FAQ.h2}</h2>
          </div>
          <div className="faq reveal" style={{ '--d': '100ms' } as React.CSSProperties}>
            {FAQ.items.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M5 12h14" />
                    <path className="faq__plus" d="M12 5v14" />
                  </svg>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
