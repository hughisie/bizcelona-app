import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Outcomes from '@/components/sections/Outcomes';
import Band from '@/components/sections/Band';
import TimeBank from '@/components/sections/TimeBank';
import Rhythm from '@/components/sections/Rhythm';
import ForWhom from '@/components/sections/ForWhom';
import Rules from '@/components/sections/Rules';
import Partnerships from '@/components/sections/Partnerships';
import Faq from '@/components/sections/Faq';
import Apply from '@/components/sections/Apply';
import { FAQ, HERO, META } from './_content/content';

const OG_IMAGE = {
  url: '/images/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Bizcelona logo in off-white on navy, with the headline Building wealth through community.',
};

export const metadata: Metadata = {
  title: { absolute: META.title },
  description: META.description,
  alternates: { canonical: 'https://bizcelona.com' },
  openGraph: {
    title: META.ogTitle,
    description: META.ogDescription,
    url: 'https://bizcelona.com',
    siteName: 'Bizcelona',
    images: [OG_IMAGE],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: META.ogTitle,
    description: META.ogDescription,
    images: [OG_IMAGE.url],
    creator: '@bizcelona',
  },
};

// Organization, WebSite, WebPage and FAQPage. The FAQ text comes from the same source as the visible answers.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://bizcelona.com/#organization',
      name: 'Bizcelona',
      url: 'https://bizcelona.com/',
      logo: 'https://bizcelona.com/images/logo-navy.png',
      description:
        'An invitation-only business networking community in Barcelona for founders, independents and senior professionals, built on giving before taking.',
      slogan: HERO.h1,
      areaServed: { '@type': 'City', name: 'Barcelona' },
      email: 'hello@bizcelona.com',
      sameAs: ['https://www.linkedin.com/company/110331955'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://bizcelona.com/#website',
      url: 'https://bizcelona.com/',
      name: 'Bizcelona',
      inLanguage: 'en-GB',
      publisher: { '@id': 'https://bizcelona.com/#organization' },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://bizcelona.com/#webpage',
      url: 'https://bizcelona.com/',
      name: META.title,
      description: META.description,
      inLanguage: 'en-GB',
      isPartOf: { '@id': 'https://bizcelona.com/#website' },
      about: { '@id': 'https://bizcelona.com/#organization' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://bizcelona.com/#faq',
      mainEntity: FAQ.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <About />
      <Outcomes />
      <Band />
      <TimeBank />
      <Rhythm />
      <ForWhom />
      <Rules />
      <Partnerships />
      <Faq />
      <Apply />
    </>
  );
}
