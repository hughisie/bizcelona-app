import { PublicEventsClient } from './PublicEventsClient';
import type { EventCardEvent } from '@/components/events/EventCard';

type SearchParams = Promise<{ month?: string }>;

export default async function PublicEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { month: monthParam } = await searchParams;

  const today = new Date();
  const currentMonth =
    monthParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Use the public API endpoint — no auth required, CORS-open
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  let events: EventCardEvent[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/events/public?month=${currentMonth}`, {
      // Don't cache in dev; in prod cache for 5 minutes
      next: { revalidate: 300 },
    });
    const json = await res.json();
    if (json.ok) events = json.data ?? [];
  } catch {
    // Silently fall back to empty list if fetch fails
  }

  return <PublicEventsClient events={events} currentMonth={currentMonth} />;
}
