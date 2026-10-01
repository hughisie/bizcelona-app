import { ViewTransition } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RevealObserver from '@/components/site/RevealObserver';
import './site.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

// Marks the page as script-enabled before first paint, so scroll reveals can
// start hidden only when something is there to show them. Without JS everything stays visible.
const JS_FLAG = `document.documentElement.classList.add('js')`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${bricolage.variable}`}>
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
