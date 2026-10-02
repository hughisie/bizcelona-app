// Public site languages. English is the default and lives at the root; Spanish and Catalan live under /es and /ca.
// Only the public pages (home and events) are translated. Sign-up, log in, member and admin routes stay English.
export const LOCALES = ['en', 'es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const SITE_URL = 'https://www.bizcelona.com';

export const HTML_LANG: Record<Locale, string> = { en: 'en-GB', es: 'es', ca: 'ca' };
export const HREFLANG: Record<Locale, string> = { en: 'en', es: 'es', ca: 'ca' };
export const OG_LOCALE: Record<Locale, string> = { en: 'en_GB', es: 'es_ES', ca: 'ca_ES' };
export const LANGUAGE_NAME: Record<Locale, string> = { en: 'English', es: 'Español', ca: 'Català' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Path of a public page in a given language. `page` is '/' or '/events/public'. */
export function localePath(locale: Locale, page: '/' | '/events/public' = '/'): string {
  if (locale === DEFAULT_LOCALE) return page;
  return page === '/' ? `/${locale}` : `/${locale}${page}`;
}

export function absoluteUrl(locale: Locale, page: '/' | '/events/public' = '/'): string {
  const path = localePath(locale, page);
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

/** Strips a leading /es or /ca from a pathname, so the language switcher can find the same page in another language. */
export function pageOf(pathname: string): { locale: Locale; page: '/' | '/events/public' } {
  const m = pathname.match(/^\/(es|ca)(\/.*)?$/);
  const locale = (m ? m[1] : DEFAULT_LOCALE) as Locale;
  const rest = m ? m[2] || '/' : pathname;
  return { locale, page: rest.startsWith('/events') ? '/events/public' : '/' };
}

/** hreflang alternates for a page, including x-default (English). Every language lists every other and itself. */
export function languageAlternates(page: '/' | '/events/public' = '/'): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[HREFLANG[l]] = absoluteUrl(l, page);
  map['x-default'] = absoluteUrl(DEFAULT_LOCALE, page);
  return map;
}
