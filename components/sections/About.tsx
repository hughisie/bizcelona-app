export default function About() {
  return (
    <section id="about" className="section on-light" aria-labelledby="about-title">
      <div className="wrap">
        <div className="split split--about">
          <div className="reveal">
            <p className="label">What Bizcelona is</p>
            <h2 id="about-title">Give before <mark>you take.</mark></h2>
            <p className="lede">
              Bizcelona is a membership community for founders, independents and senior business figures in Barcelona.
            </p>
            <div className="measure stack">
              <p>
                Members assist one another in hitting their financial and commercial targets. Here, helping others is the currency: those who give support move up, while those who merely take slip down. The size is limited deliberately, with a balanced core of 100 to 150 active members, and each application is reviewed by hand.
              </p>
              <p>
                It is also led by its own members, through a council of senior volunteers, rather than being the project of a single individual.
              </p>
            </div>
            <ul className="not-list measure" aria-label="What Bizcelona is not">
              <li>It is not a costly founders&rsquo; club.</li>
              <li>Nor is it a bar gathering where everyone is out to sell something to everyone else.</li>
            </ul>
          </div>
          <figure className="figure reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="panel-art" role="img" aria-label="Abstract plan of the Eixample street grid with a few connected points">
              <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                <defs>
                  <pattern id="about-blocks" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M22 10H78L90 22V78L78 90H22L10 78V22Z" className="net__block" />
                  </pattern>
                </defs>
                <rect width="400" height="500" fill="url(#about-blocks)" />
                <g className="net__edge" fill="none"><path d="M150 150 L250 150 L250 250 L150 350 L250 450" /></g>
                {[[150,150],[250,150],[250,250],[150,350],[250,450]].map(([x,y]) => (
                  <g key={`${x}-${y}`}><circle className="net__halo" cx={x} cy={y} r="11" /><circle className="net__dot" cx={x} cy={y} r="3.4" /></g>
                ))}
              </svg>
            </div>
            <figcaption>The Eixample grid, where every corner stays open.</figcaption>
          </figure>
        </div>

        <div className="bet reveal">
          <p className="label">Why now</p>
          <p className="muted measure">
            As AI takes on more desk-based work, a dependable local circle of people who genuinely turn up grows more valuable with each passing year.
          </p>
          <blockquote>
            <p className="display">
              A group of senior people each giving a bit of focused time can build something great. Nobody gives
              up their week; just a little time, pointed in the right direction.
            </p>
            <cite>Owen Hughes, founder and chair</cite>
          </blockquote>
        </div>

        <div className="essence">
          <div className="reveal">
            <h3>Curated.</h3>
            <p>A well-balanced core of active members. Each application is read personally.</p>
          </div>
          <div className="reveal" style={{ '--d': '90ms' } as React.CSSProperties}>
            <h3>Collaborative.</h3>
            <p>Give before you take. Here, helping one another is the currency.</p>
          </div>
          <div className="reveal" style={{ '--d': '180ms' } as React.CSSProperties}>
            <h3>Connected.</h3>
            <p>Relationships built on trust over the long term, with people who show up.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
