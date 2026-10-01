import { ViewTransition } from 'react';
import localFont from 'next/font/local';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RevealObserver from '@/components/site/RevealObserver';
import './site.css';

// Self-hosted, trimmed copies of the brand fonts (SIL OFL), cut down to Latin glyphs and only the
// weights this site uses: Bricolage Grotesque SemiBold (18 KB) and Inter 400 to 600 (24 KB).
// That is under half the weight of the full Google Fonts files, which matters for first paint.
const bricolage = localFont({
  src: './fonts/BricolageGrotesque-SemiBold-latin.woff2',
  weight: '600',
  style: 'normal',
  display: 'swap',
  variable: '--font-bricolage',
  adjustFontFallback: 'Arial',
});

const inter = localFont({
  src: './fonts/Inter-400-600-latin.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter-site',
  adjustFontFallback: 'Arial',
});

// Marks the page as script-enabled before first paint, so scroll reveals can
// start hidden only when something is there to show them. Without JS everything stays visible.
const JS_FLAG = `document.documentElement.classList.add('js')`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${bricolage.variable} ${inter.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      <a className="skip-link" href="#main">Skip to main content</a>
      <Navbar />
      <ViewTransition default="page">
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </ViewTransition>
      <Footer />
      <RevealObserver />
    </div>
  );
}
