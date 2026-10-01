export default function Partnerships() {
  return (
    <section id="partnerships" className="section on-light" aria-labelledby="partners-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">Partnerships</p>
          <h2 id="partners-title">Partners who give before they <mark>take.</mark></h2>
          <p className="lede">
            We want partnerships that make the member experience better, not transactional sponsorships or brand deals.
          </p>
        </div>
        <div className="measure reveal">
          <p>
            The right partner shares our commitment to mutual support, real collaboration and long-term community
            growth. That might be exclusive member benefits, educational opportunities or shared resources. We put
            quality and relevance ahead of everything else, and we only pursue partnerships that genuinely serve
            our members.
          </p>
        </div>
        <div className="panels">
          <div className="panel reveal">
            <h3>Venue partners</h3>
            <p>
              Our co-working days rotate between partner spaces, and our monthly event needs a good room. If you
              run a space that suits focused work and lunch together, we would like to hear from you.
            </p>
          </div>
          <div className="panel reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <h3>Perks and sponsors</h3>
            <p>
              If you offer something members would use, such as a perk, a workshop or a resource, tell us what and
              why. We will say yes only when it is useful.
            </p>
          </div>
        </div>
        <div className="btn-row reveal">
          <a className="btn btn--navy" href="mailto:hello@bizcelona.com?subject=Partnering%20with%20Bizcelona">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
