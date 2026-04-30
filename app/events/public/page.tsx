import { createClient } from '@/lib/supabase/server';
import { PublicEventsClient } from './PublicEventsClient';

type SearchParams = Promise<{ month?: string }>;

export default async function PublicEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { month: monthParam } = await searchParams;

  const today = new Date();
  const currentMonth =
    monthParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const supabase = await createClient();
  const startOf = `${currentMonth}-01`;
  const endOf = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0)
    .toISOString()
    .split('T')[0];

  const { data: events } = await supabase
    .from('events')
    .select('id, slug, title, description, event_date, end_date, location, cover_image_url, external_url, platform, category, organiser_id, is_published')
    .eq('is_published', true)
    .gte('event_date', `${startOf}T00:00:00.000Z`)
    .lte('event_date', `${endOf}T23:59:59.999Z`)
    .order('event_date', { ascending: true });

  const safeEvents = events ?? [];

  return <PublicEventsClient events={safeEvents} currentMonth={currentMonth} />;
}
