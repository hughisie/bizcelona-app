import Link from 'next/link';
import Picture from '@/components/site/Picture';
import { APPLY } from '@/app/(site)/_content/content';

export default function Apply() {
  return (
    <section id="apply" className="section apply-sec on-navy" aria-labelledby="apply-title">
      <div className="apply-sec__photo par" aria-hidden="true">
        <Picture name="sunset" sizes={[800, 1600]} sizesAttr="100vw" width={1600} height={1067} alt="" lazy />
      </div>
      <div className="apply-sec__veil" aria-hidden="true" />
      <div className="wrap apply-sec__inner">
        <div className="apply">
          <div className="reveal">
            <p className="label">{APPLY.label}</p>
            <h2 id="apply-title">
              {APPLY.h2Lead} <span className="accent">{APPLY.h2Accent}</span> {APPLY.h2Tail}
            </h2>
            <p className="lede">{APPLY.lede}</p>
          </div>
          <div>
            <ol className="apply-steps reveal">
              {APPLY.steps.map((s) => (
                <li key={s.title}>
                  <div>
                    <strong>{s.title}</strong>
                    <span>{s.body}</span>
                  </div>
                </li>
              ))}
            </ol>
            <div id="contact" className="apply-box reveal">
              <h3>{APPLY.boxTitle}</h3>
              <p>{APPLY.boxBody}</p>
              <div className="btn-row">
                <Link className="btn btn--saffron" href="/signup">{APPLY.primary}</Link>
                <Link className="btn btn--ghost" href="/login">{APPLY.login}</Link>
              </div>
              <p className="apply-box__mail">
                {APPLY.mailLead}<a href="mailto:hello@bizcelona.com">hello@bizcelona.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
