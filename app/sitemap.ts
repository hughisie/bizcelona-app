import { MetadataRoute } from 'next';
import { LOCALES, SITE_URL, absoluteUrl, languageAlternates } from '@/lib/site/locales';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const now = new Date();

  // Public pages exist in every language; each entry lists all of them plus x-default.
  const localised = (page: '/' | '/events/public', changeFrequency: 'daily' | 'weekly', priority: number): MetadataRoute.Sitemap =>
    LOCALES.map((l) => ({
      url: absoluteUrl(l, page),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(page) },
    }));

  return [
    ...localised('/', 'daily', 1),
    ...localised('/events/public', 'weekly', 0.7),
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/apply`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
