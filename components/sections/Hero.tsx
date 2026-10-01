import Link from 'next/link';
import HeroNetwork from '@/components/site/HeroNetwork';

export default function Hero() {
  return (
    <section id="home" className="hero on-navy" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <HeroNetwork />
      </div>
      <div className="wrap hero__inner">
        <p className="label hero__label">Barcelona&rsquo;s business community</p>
        <h1 id="hero-title">Building wealth through community.</h1>
        <p className="lede hero__lede">
          Where Barcelona&rsquo;s founders and professionals collaborate, share insight, and scale together.
        </p>
        <div className="btn-row hero__cta">
          <Link className="btn btn--saffron" href="/signup">Apply to join</Link>
          <a className="btn btn--ghost" href="#time-bank">See how it works</a>
        </div>
        <ul className="hero__facts" aria-label="At a glance">
          <li>By invitation</li>
          <li>Free during the relaunch</li>
        </ul>
      </div>
    </section>
  );
}
