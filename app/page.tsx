import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Rules from '@/components/sections/Rules';
import Partnerships from '@/components/sections/Partnerships';
import Apply from '@/components/sections/Apply';
import Script from 'next/script';

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bizcelona.com/#organization",
        "name": "Bizcelona",
        "url": "https://bizcelona.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bizcelona.com/images/bizcelona-logo-transparent.png"
        },
        "description": "Barcelona's premier invite-only business community for entrepreneurs, senior executives, business owners, and digital nomads.",
        "sameAs": [
          "https://www.linkedin.com/company/110331955"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Barcelona",
          "addressCountry": "ES"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://bizcelona.com/#website",
        "url": "https://bizcelona.com",
        "name": "Bizcelona",
        "description": "Join Barcelona's exclusive business community for entrepreneurs, executives, and digital nomads.",
        "publisher": {
          "@id": "https://bizcelona.com/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "WebPage",
        "@id": "https://bizcelona.com/#webpage",
        "url": "https://bizcelona.com",
        "name": "Bizcelona | Exclusive Business Community for Barcelona Entrepreneurs & Executives",
        "isPartOf": {
          "@id": "https://bizcelona.com/#website"
        },
        "about": {
          "@id": "https://bizcelona.com/#organization"
        },
        "description": "Join Barcelona's premier invite-only business community for entrepreneurs, senior executives, business owners, and digital nomads. Connect with like-minded professionals.",
        "inLanguage": "en-US"
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://bizcelona.com/#service",
        "name": "Bizcelona Business Networking",
        "description": "Curated business networking community connecting entrepreneurs, executives, and digital nomads in Barcelona",
        "provider": {
          "@id": "https://bizcelona.com/#organization"
        },
        "areaServed": {
          "@type": "City",
          "name": "Barcelona",
          "containedInPlace": {
            "@type": "Country",
            "name": "Spain"
          }
        },
        "audience": {
          "@type": "BusinessAudience",
          "name": "Entrepreneurs, Executives, Business Owners, Digital Nomads"
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Rules />
        <Partnerships />
        <Apply />
      </main>
      <Footer />
    </>
  );
}
