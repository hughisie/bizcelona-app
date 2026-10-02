import { Inter } from 'next/font/google';
import '@/app/globals.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  // The public site ships its own trimmed Inter, so this full one is not preloaded for every page.
  preload: false,
  variable: '--font-inter',
});

// The <html> and <body> for every route. Two root layouts share it: the app itself (English, sign-up, members, admin)
// and the translated public pages, which need a different lang attribute.
export default function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={inter.variable}>
      <body className={`${inter.className} font-inter text-navy bg-off-white antialiased`}>
        <GoogleAnalytics measurementId="G-88GKT7X9KG" />
        {children}
      </body>
    </html>
  );
}
