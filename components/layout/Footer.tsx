import Link from 'next/link';
import type { Content } from '@/lib/site/content';
import { localePath, type Locale } from '@/lib/site/locales';

export default function Footer({ locale, ui }: { locale: Locale; ui: Content['ui'] }) {
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div>
          <img src="/images/logo-offwhite-256.webp" alt={ui.logoAlt} width={128} height={55} loading="lazy" decoding="async" />
          <p className="foot__meta">{ui.footerTagline}</p>
          <p className="foot__meta">{ui.footerCopy}</p>
        </div>
        <ul className="foot__links">
          <li><Link href={localePath(locale, '/events/public')}>{ui.footerEvents}</Link></li>
          <li><Link href="/signup">{ui.footerApply}</Link></li>
          <li><Link href="/login">{ui.footerLogin}</Link></li>
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
