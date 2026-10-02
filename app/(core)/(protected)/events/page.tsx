import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { isUserOrganiser } from '@/lib/organiser';
import { EventsClient } from './EventsClient';
import type { EventCardEvent } from '@/components/events/EventCard';

type SearchParams = Promise<{ month?: string }>;

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { month: monthParam } = await searchParams;

  // Default to current month
  const today = new Date();
  const currentMonth =
    monthParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [adminStatus, organiserStatus] = await Promise.all([
    isUserAdmin(),
    isUserOrganiser(),
  ]);

  const canSeeUnpublished = adminStatus || organiserStatus;

  // Parse month range for query
  const [year, mon] = currentMonth.split('-');
  const from = `${year}-${mon}-01`;
  const nextMonthNum = parseInt(mon, 10) === 12
    ? `${parseInt(year, 10) + 1}-01-01`
    : `${year}-${String(parseInt(mon, 10) + 1).padStart(2, '0')}-01`;

  let query = supabase
    .from('events')
    .select('id, slug, title, description, event_date, end_date, location, cover_image_url, external_url, platform, category, organiser_id, is_published')
    .gte('event_date', from)
    .lt('event_date', nextMonthNum)
    .order('event_date', { ascending: true });

  if (!canSeeUnpublished) {
    query = query.eq('is_published', true);
  }

  const { data } = await query;
  const events: EventCardEvent[] = data ?? [];

  return (
    <EventsClient
      events={events}
      currentMonth={currentMonth}
      isOrganiser={organiserStatus}
      isAdmin={adminStatus}
      currentUserId={user.id}
    />
  );
}
