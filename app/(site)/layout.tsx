import { ViewTransition } from 'react';
import localFont from 'next/font/local';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RevealObserver from '@/components/site/RevealObserver';
import SceneController from '@/components/site/SceneController';
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

// Runs before first paint. It sets three flags on <html> so CSS can choose the right experience:
//   js    scripts are running, so scroll reveals may start hidden
//   fx    full scroll effects: not reduced motion, not Save-Data, not a slow connection
//   lite  Save-Data or a slow connection: stills instead of video, no scroll effects
//   io    this browser has no CSS scroll-driven animation, so SceneController steps the scenes instead
const FLAGS = `(function(){var h=document.documentElement,c=h.classList,n=navigator.connection,r=false,s=false;try{r=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}c.add('js');if(n&&(n.saveData||/2g|3g/.test(n.effectiveType||'')))c.add('lite');else if(!r)c.add('fx');try{s=CSS.supports('animation-timeline:scroll()')}catch(e){}if(!s)c.add('io')})()`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${bricolage.variable} ${inter.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: FLAGS }} />
      <a className="skip-link" href="#main">Skip to main content</a>
      <Navbar />
      <ViewTransition default="page">
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </ViewTransition>
      <Footer />
      <RevealObserver />
      <SceneController />
    </div>
  );
}
