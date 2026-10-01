import Link from 'next/link';

export default function Apply() {
  return (
    <section id="apply" className="section on-navy" aria-labelledby="apply-title">
      <div className="wrap">
        <div className="apply">
          <div className="reveal">
            <p className="label">Apply</p>
            <h2 id="apply-title">
              Bizcelona is by invitation. <span className="accent">Free</span> during the relaunch.
            </h2>
            <p className="lede">
              If you are a founder, independent or senior business person in Barcelona, we would like to hear from you.
            </p>
            <p className="muted measure apply__gaps">
              We keep the mix balanced. Right now we would especially like to hear from people in SEO, web, retail,
              legal and tax, finance, hospitality, and trades and craft.
            </p>
          </div>
          <div>
            <ol className="apply-steps reveal">
              <li>
                <div>
                  <strong>Create your account</strong>
                  <span>It takes a couple of minutes.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Tell us what you do and what you can help with</strong>
                  <span>Help is the currency here, so list what you can offer.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>We read every application personally</strong>
                  <span>If you are approved, we welcome you on WhatsApp.</span>
                </div>
              </li>
            </ol>
            <div id="contact" className="apply-box reveal">
              <h3>Ready?</h3>
              <p>Membership is free during the relaunch. We will prove the value before we ever charge.</p>
              <div className="btn-row">
                <Link className="btn btn--saffron" href="/signup">Apply to join</Link>
                <Link className="btn btn--ghost" href="/login">Member log in</Link>
              </div>
              <p className="apply-box__mail">
                Questions first? Write to <a href="mailto:hello@bizcelona.com">hello@bizcelona.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
