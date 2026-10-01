import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Events | Bizcelona',
  description:
    'A co-working day every two weeks and one quality event a month, for Barcelona founders, independents and senior business people.',
  alternates: { canonical: 'https://bizcelona.com/events/public' },
  openGraph: {
    title: 'Events | Bizcelona',
    description: 'A co-working day every two weeks and one quality event a month.',
    url: 'https://bizcelona.com/events/public',
  },
};

type SearchParams = Promise<{ month?: string }>;

type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  external_url: string | null;
  platform: string | null;
  category: string | null;
};

const PLATFORMS: Record<string, string> = {
  luma: 'Luma',
  eventbrite: 'Eventbrite',
  meetup: 'Meetup',
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function formatWhen(value: string): { date: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value, time: '' };
  // A start of exactly 00:00 UTC means the event was saved with a date and no time.
  const dateOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  const zone = dateOnly ? 'UTC' : 'Europe/Madrid';
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zone,
  }).format(d);
  const time = dateOnly
    ? ''
    : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone }).format(d);
  return { date, time };
}

function safeUrl(url: string | null): string {
  return url && /^https?:\/\//i.test(url) ? url : '';
}

export default async function PublicEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { month: monthParam } = await searchParams;
  const month = monthParam && MONTH.test(monthParam) ? monthParam : null;

  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('id, slug, title, description, event_date, location, external_url, platform, category')
    .eq('is_published', true)
    .order('event_date', { ascending: true });

  if (month) {
    const [y, m] = month.split('-').map(Number);
    const from = `${month}-01T00:00:00.000Z`;
    const to = new Date(Date.UTC(y, m, 1)).toISOString();
    query = query.gte('event_date', from).lt('event_date', to);
  } else {
    query = query.gte('event_date', new Date().toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  const events = (data ?? []) as PublicEvent[];

  const monthLabel = month
    ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${month}-01T00:00:00Z`),
      )
    : null;

  return (
    <>
      <section className="page-head on-navy" aria-labelledby="events-title">
        <div className="wrap">
          <p className="label">Show up</p>
          <h1 id="events-title">Events</h1>
          <p className="lede">A co-working day every two weeks, and one quality event a month.</p>
        </div>
      </section>

      <section className="section on-light" aria-label={monthLabel ? `Events in ${monthLabel}` : 'Upcoming events'}>
        <div className="wrap">
          {monthLabel && (
            <p className="events__filter">
              Showing {monthLabel}. <Link className="link-plain" href="/events/public">See all upcoming events</Link>
            </p>
          )}

          {error ? (
            <div className="empty">
              <h2>We could not load the events just now.</h2>
              <p className="muted measure">Please try again in a moment, or write to us at hello@bizcelona.com.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty">
              <h2>No dates published yet.</h2>
              <p className="muted measure">
                We hold a co-working day every two weeks and one quality event a month. Dates appear here as soon
                as they are confirmed.
              </p>
              <div className="btn-row">
                <Link className="btn btn--navy" href="/signup">Apply to join</Link>
              </div>
            </div>
          ) : (
            <ul className="events">
              {events.map((ev) => {
                const when = formatWhen(ev.event_date);
                const url = safeUrl(ev.external_url);
                const platform = ev.platform ? PLATFORMS[ev.platform] : undefined;
                return (
                  <li key={ev.id} className="event">
                    <p className="event__date">
                      <time dateTime={ev.event_date}>{when.date}</time>
                      {when.time && <span className="event__time">{when.time}</span>}
                    </p>
                    <div className="event__body">
                      {ev.category && <span className="cat">{ev.category}</span>}
                      <h2>{ev.title}</h2>
                      {ev.location && <p className="event__meta">{ev.location}</p>}
                      {ev.description && <p className="event__desc">{ev.description}</p>}
                      {url && (
                        <a className="btn btn--saffron" href={url} target="_blank" rel="noopener noreferrer">
                          RSVP{platform ? ` on ${platform}` : ''}
                          <span className="sr-only"> for {ev.title} (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
