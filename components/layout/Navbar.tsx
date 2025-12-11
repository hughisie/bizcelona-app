'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300 ${
        scrolled ? 'bg-white/95' : 'bg-white/90'
      }`}
      id="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/bizcelona-logo-transparent.png"
                alt="Bizcelona"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#hero"
                onClick={(e) => scrollToSection(e, '#hero')}
                className="nav-link text-navy hover:text-saffron transition-colors duration-200"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => scrollToSection(e, '#about')}
                className="nav-link text-navy hover:text-saffron transition-colors duration-200"
              >
                About
              </a>
              <a
                href="#apply"
                onClick={(e) => scrollToSection(e, '#apply')}
                className="nav-link text-navy hover:text-saffron transition-colors duration-200"
              >
                Apply
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="nav-link text-navy hover:text-saffron transition-colors duration-200"
              >
                Contact
              </a>
              <Link
                href="/login"
                className="nav-link text-navy hover:text-saffron transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-saffron text-navy px-4 py-2 rounded-lg font-semibold hover:bg-orange-400 transition-all duration-200"
              >
                Apply
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-button text-navy hover:text-saffron focus:outline-none focus:text-saffron transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`mobile-menu md:hidden bg-white border-t border-gray-200 ${
          isOpen ? 'open' : ''
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, '#hero')}
            className="nav-link block px-3 py-2 text-navy hover:text-saffron transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, '#about')}
            className="nav-link block px-3 py-2 text-navy hover:text-saffron transition-colors duration-200"
          >
            About
          </a>
          <a
            href="#apply"
            onClick={(e) => scrollToSection(e, '#apply')}
            className="nav-link block px-3 py-2 text-navy hover:text-saffron transition-colors duration-200"
          >
            Apply
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="nav-link block px-3 py-2 text-navy hover:text-saffron transition-colors duration-200"
          >
            Contact
          </a>
          <Link
            href="/login"
            className="nav-link block px-3 py-2 text-navy hover:text-saffron transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="block mx-3 my-2 bg-saffron text-navy px-4 py-2 rounded-lg font-semibold hover:bg-orange-400 transition-all duration-200 text-center"
          >
            Apply
          </Link>
        </div>
      </div>
    </nav>
  );
}
