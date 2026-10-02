'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#time-bank', label: 'Time bank' },
  { href: '/#rules', label: 'House rules' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/events/public', label: 'Events' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        <Link className="nav__brand" href="/" aria-label="Bizcelona, home">
          <img src="/images/logo-offwhite-256.webp" alt="Bizcelona" width={128} height={55} decoding="async" />
        </Link>

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
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="site-nav" className="nav__panel" data-open={open} aria-label="Main">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  className="nav__link"
                  href={l.href}
                  aria-current={l.href.startsWith('/events') && pathname.startsWith('/events') ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="nav__link" href="/login">Log in</Link>
            </li>
            <li>
              <Link className="btn btn--saffron" href="/signup">Apply</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
