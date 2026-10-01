export default function Partnerships() {
  return (
    <section id="partnerships" className="section on-light" aria-labelledby="partners-title">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="label">Partnerships</p>
          <h2 id="partners-title">Partners who give before they <mark>take.</mark></h2>
          <p className="lede">
            We are looking for partnerships that improve the member experience, not purely transactional sponsorships or brand deals.
          </p>
        </div>
        <div className="measure reveal">
          <p>
            A suitable partner will share our dedication to helping one another, working together properly and building the community over the long term. That could take the form of members-only benefits, learning opportunities or pooled resources. Quality and relevance come before anything else for us, and we only take on partnerships that are of real service to our members.
          </p>
        </div>
        <div className="panels">
          <div className="panel reveal">
            <h3>Venue partners</h3>
            <p>
              Our co-working sessions move between partner venues, and our monthly event requires a decent room. If you operate a space that works for concentrated work followed by lunch together, get in touch.
            </p>
          </div>
          <div className="panel reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <h3>Perks and sponsors</h3>
            <p>
              If you have something members would actually make use of, whether a perk, a workshop or a resource, let us know what it is and why. We only say yes when it is genuinely useful.
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
