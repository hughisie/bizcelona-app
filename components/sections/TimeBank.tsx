import LazyClip from '@/components/site/LazyClip';
import type { Content } from '@/lib/site/content';

// Pinned storytelling: the section sticks while you scroll and the four steps light up one after another.
// Without scroll effects it is a plain four-card row with a saffron thread.
export default function TimeBank({ c }: { c: Content }) {
  const TIME_BANK = c.timeBank;
  return (
    <section id="time-bank" className="tb on-navy" aria-labelledby="timebank-title" data-scene="step" data-base="1" data-step="1">
      <div className="tb__stage">
        <div className="tb__pin">
          <div className="tb__bg" aria-hidden="true">
            <picture>
              <source type="image/avif" srcSet="/media/tb-topdown-poster.avif" />
              <img src="/media/tb-topdown-poster.webp" alt="" width={960} height={540} loading="lazy" decoding="async" />
            </picture>
            <LazyClip name="tb-topdown" />
          </div>
          <div className="wrap tb__grid">
            <div className="tb__head reveal">
              <p className="label">{TIME_BANK.label}</p>
              <h2 id="timebank-title">{TIME_BANK.h2}</h2>
              <p className="lede muted">{TIME_BANK.lede}</p>
            </div>

            <div className="tb__numerals" aria-hidden="true">
              {TIME_BANK.steps.map((s, i) => (
                <span key={s.title} className="tb__numeral" style={{ '--n': i } as React.CSSProperties}>{i + 1}</span>
              ))}
            </div>

            <div className="steps-wrap">
              <span className="steps__line" aria-hidden="true" />
              <ol className="steps">
                {TIME_BANK.steps.map((s, i) => (
                  <li key={s.title} className="step" style={{ '--n': i } as React.CSSProperties}>
                    <span className="step__num" aria-hidden="true">{i + 1}</span>
                    <h3>
                      {s.title}
                      {s.free && <span className="tag-free">{c.ui.free}</span>}
                    </h3>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <span className="tb__rail" aria-hidden="true"><span /></span>
        </div>

        {/* Invisible markers for the fallback that steps the scene in browsers without scroll-driven CSS. Not content. */}
        {[1, 2, 3].map((k) => <span key={k} className="mark" data-mark aria-hidden="true" />)}
      </div>
      <div className="wrap">
        <p className="note reveal">
          <strong>{TIME_BANK.note}</strong>
        </p>
      </div>
    </section>
  );
}
