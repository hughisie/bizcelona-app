import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import EventsPage from '@/components/site/EventsPage';
import { eventsMetadata } from '@/lib/site/seo';
import { isLocale } from '@/lib/site/locales';

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? eventsMetadata(locale) : {};
}

export default async function LocalisedEvents({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { locale } = await params;
  const { month } = await searchParams;
  if (!isLocale(locale) || locale === 'en') notFound();
  return <EventsPage locale={locale} month={month} />;
}
