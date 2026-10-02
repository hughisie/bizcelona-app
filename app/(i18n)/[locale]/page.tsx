import { notFound } from 'next/navigation';
import HomePage from '@/components/site/HomePage';
import { homeMetadata } from '@/lib/site/seo';
import { isLocale } from '@/lib/site/locales';
import type { Metadata } from 'next';

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? homeMetadata(locale) : {};
}

export default async function LocalisedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();
  return <HomePage locale={locale} />;
}
