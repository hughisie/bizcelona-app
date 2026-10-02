import { notFound } from 'next/navigation';
import RootDocument from '@/components/site/RootDocument';
import SiteShell from '@/components/site/SiteShell';
import { rootMetadata, rootViewport } from '@/lib/site/root-metadata';
import { HTML_LANG, LOCALES, isLocale } from '@/lib/site/locales';

// Second root layout: the translated public pages. It exists only so <html lang> can differ per language.
export const metadata = rootMetadata;
export const viewport = rootViewport;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== 'en').map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();
  return (
    <RootDocument lang={HTML_LANG[locale]}>
      <SiteShell locale={locale}>{children}</SiteShell>
    </RootDocument>
  );
}
