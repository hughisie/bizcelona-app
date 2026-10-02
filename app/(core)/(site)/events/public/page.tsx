import EventsPage from '@/components/site/EventsPage';
import { eventsMetadata } from '@/lib/site/seo';

export const metadata = eventsMetadata('en');

type SearchParams = Promise<{ month?: string }>;

export default async function PublicEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { month } = await searchParams;
  return <EventsPage locale="en" month={month} />;
}
