import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div>
          <Image
            src="/images/logo-offwhite.png"
            alt="Bizcelona"
            width={763}
            height={327}
            sizes="128px"
            loading="lazy"
          />
          <p className="foot__meta">&copy; 2026 Bizcelona. Built with love in Barcelona.</p>
        </div>
        <ul className="foot__links">
          <li><Link href="/events/public">Events</Link></li>
          <li><Link href="/signup">Apply</Link></li>
          <li><Link href="/login">Member log in</Link></li>
          <li>
            <a href="https://www.linkedin.com/company/110331955" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
          <li>
            <a href="https://barna.news" target="_blank" rel="noopener noreferrer">Barna.News</a>
          </li>
          <li><a href="mailto:hello@bizcelona.com">hello@bizcelona.com</a></li>
        </ul>
      </div>
    </footer>
  );
}
