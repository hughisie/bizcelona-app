import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="section on-light" aria-labelledby="about-title">
      <div className="wrap">
        <div className="split split--about">
          <div className="reveal">
            <p className="label">What Bizcelona is</p>
            <h2 id="about-title">Give before <mark>you take.</mark></h2>
            <p className="lede">
              Bizcelona is a membership community for Barcelona founders, independents and senior business people.
            </p>
            <div className="measure stack">
              <p>
                Members help each other reach their financial and business goals. Helping is the currency here:
                members who help rise, and members who only take drift down. We keep it small on purpose, a
                balanced core of 100 to 150 active members, and every application is read personally.
              </p>
              <p>
                And it is run by the people in it, by a council of senior volunteers, not a one-person show.
              </p>
            </div>
            <ul className="not-list measure" aria-label="What Bizcelona is not">
              <li>It is not an expensive founder club.</li>
              <li>It is not a bar meetup full of people trying to sell each other something.</li>
            </ul>
          </div>
          <figure className="figure reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <Image
              src="/images/barcelona-sunset-1280.jpg"
              alt="Barcelona rooftops at sunset, with Torre Glòries and the Columbus monument"
              width={1280}
              height={853}
              sizes="(min-width: 64em) 36rem, 100vw"
              loading="lazy"
            />
            <figcaption>Our city, in warm, low light.</figcaption>
          </figure>
        </div>

        <div className="bet reveal">
          <p className="label">Why now</p>
          <p className="muted measure">
            As AI eats more desk work, a trusted local network of people who actually show up becomes more
            valuable every year.
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
            <p>A balanced core of active members. Every application reviewed personally.</p>
          </div>
          <div className="reveal" style={{ '--d': '90ms' } as React.CSSProperties}>
            <h3>Collaborative.</h3>
            <p>Give before you take. Helping is the currency here.</p>
          </div>
          <div className="reveal" style={{ '--d': '180ms' } as React.CSSProperties}>
            <h3>Connected.</h3>
            <p>Long-term, trust-based relationships with people who show up.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
