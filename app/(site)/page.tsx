import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import TimeBank from '@/components/sections/TimeBank';
import Rhythm from '@/components/sections/Rhythm';
import Ladder from '@/components/sections/Ladder';
import Council from '@/components/sections/Council';
import Rules from '@/components/sections/Rules';
import Partnerships from '@/components/sections/Partnerships';
import Apply from '@/components/sections/Apply';

export const metadata: Metadata = {
  alternates: { canonical: 'https://bizcelona.com' },
};

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
        "An invitation-only community for founders, independents and senior business figures based in Barcelona, built on giving before taking. Where the city's founders and professionals work together, exchange ideas and grow as a group.",
      slogan: 'Building wealth through community.',
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
      <TimeBank />
      <Rhythm />
      <Ladder />
      <Council />
      <Rules />
      <Partnerships />
      <Apply />
    </>
  );
}
