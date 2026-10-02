import type { Metadata } from 'next';
import { getContent, type Content } from './content';
import { HREFLANG, HTML_LANG, LOCALES, OG_LOCALE, SITE_URL, absoluteUrl, languageAlternates, type Locale } from './locales';

const OG_IMAGE = { url: '/images/og-image.jpg', width: 1200, height: 630 };

function pageMeta(locale: Locale, page: '/' | '/events/public', title: string, description: string, ogTitle: string, ogDescription: string, alt: string): Metadata {
  const url = absoluteUrl(locale, page);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(page) },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: 'Bizcelona',
      images: [{ ...OG_IMAGE, alt }],
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: ogDescription, images: [OG_IMAGE.url], creator: '@bizcelona' },
  };
}

export function homeMetadata(locale: Locale): Metadata {
  const { meta } = getContent(locale);
  return pageMeta(locale, '/', meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImageAlt);
}

export function eventsMetadata(locale: Locale): Metadata {
  const { events } = getContent(locale);
  return pageMeta(locale, '/events/public', events.title, events.description, events.title, events.description, events.ogImageAlt);
}

// Organization, WebSite, WebPage and FAQPage for one language. The FAQ text comes from the same source as the visible answers.
export function homeStructuredData(locale: Locale, c: Content) {
  const url = absoluteUrl(locale, '/');
  const lang = HTML_LANG[locale];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Bizcelona',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/images/logo-navy.png`,
        description: c.meta.orgDescription,
        slogan: c.hero.h1,
        areaServed: { '@type': 'City', name: 'Barcelona' },
        email: 'hello@bizcelona.com',
        sameAs: ['https://www.linkedin.com/company/110331955'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'Bizcelona',
        inLanguage: LOCALES.map((l) => HTML_LANG[l]),
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: c.meta.title,
        description: c.meta.description,
        inLanguage: lang,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        // Points search engines at the same page in the other languages.
        workTranslation: LOCALES.filter((l) => l !== locale).map((l) => ({ '@type': 'WebPage', url: absoluteUrl(l, '/'), inLanguage: HTML_LANG[l] })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang,
        mainEntity: c.faq.items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

export { HREFLANG };
