'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Content } from '@/lib/site/content';
import { HREFLANG, LANGUAGE_NAME, LOCALES, localePath, pageOf, type Locale } from '@/lib/site/locales';

export default function Navbar({ locale, ui }: { locale: Locale; ui: Content['ui'] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const home = localePath(locale, '/');
  const onEvents = pageOf(pathname).page === '/events/public';
  const current = pageOf(pathname).page;

  const LINKS = [
    { href: `${home}#about`, label: ui.navAbout },
    { href: `${home}#time-bank`, label: ui.navTimeBank },
    { href: `${home}#rules`, label: ui.navRules },
    { href: `${home}#faq`, label: ui.navFaq },
    { href: localePath(locale, '/events/public'), label: ui.navEvents, events: true },
  ];

  // Close after any navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav">
      <div className="wrap nav__bar">
        <Link className="nav__brand" href={home} aria-label={ui.homeAria}>
          <img src="/images/logo-offwhite-256.webp" alt={ui.logoAlt} width={128} height={55} decoding="async" />
        </Link>

        <ul className="nav__lang" aria-label={ui.language}>
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={localePath(l, current)}
                hrefLang={HREFLANG[l]}
                lang={HREFLANG[l]}
                aria-label={LANGUAGE_NAME[l]}
                aria-current={l === locale ? 'true' : undefined}
              >
                {l.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>

        <button
          ref={buttonRef}
          className="nav__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path className="nav__bar-top" d="M4 8h16" />
            <path className="nav__bar-bottom" d="M4 16h16" />
          </svg>
          {open ? ui.close : ui.menu}
        </button>

        <nav id="site-nav" className="nav__panel" data-open={open} aria-label={ui.mainNav}>
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link className="nav__link" href={l.href} aria-current={l.events && onEvents ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="nav__link" href="/login">{ui.navLogin}</Link>
            </li>
            <li>
              <Link className="btn btn--saffron" href="/signup">{ui.navApply}</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
