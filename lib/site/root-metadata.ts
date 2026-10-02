import type { Metadata, Viewport } from 'next';

const TITLE = 'Bizcelona | Building wealth through community';
const DESCRIPTION =
  "Where Barcelona's founders and professionals work together, exchange ideas and grow as a group. An invitation-only members' community, free of charge while the relaunch is under way.";

// Defaults for the whole site. Public pages override title, description, canonical and Open Graph per language.
export const rootMetadata: Metadata = {
  metadataBase: new URL('https://bizcelona.com'),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: 'Bizcelona' }],
  creator: 'Bizcelona',
  publisher: 'Bizcelona',
  category: 'Business community',
  openGraph: {
    title: 'Bizcelona | Building wealth through community',
    description:
      "Barcelona's business community for founders, independents and senior business figures. Members support one another. Invitation only, free during the relaunch.",
    url: 'https://bizcelona.com',
    siteName: 'Bizcelona',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bizcelona logo in off-white on navy, with the headline Building wealth through community.',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bizcelona | Building wealth through community',
    description:
      "Barcelona's business community for founders, independents and senior business figures. Invitation only, free during the relaunch.",
    images: ['/images/og-image.jpg'],
    creator: '@bizcelona',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/images/favicon-48.png', sizes: '48x48', type: 'image/png' }],
    apple: '/images/apple-touch-icon.png',
  },
};

export const rootViewport: Viewport = { themeColor: '#1a202c' };
