import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Picture from '@/components/site/Picture';
import { getContent } from '@/lib/site/content';
import { localePath, type Locale } from '@/lib/site/locales';

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

function formatWhen(value: string, loc: string): { date: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value, time: '' };
  // A start of exactly 00:00 UTC means the event was saved with a date and no time.
  const dateOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  const zone = dateOnly ? 'UTC' : 'Europe/Madrid';
  const date = new Intl.DateTimeFormat(loc, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zone,
  }).format(d);
  const time = dateOnly
    ? ''
    : new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone }).format(d);
  return { date, time };
}

function safeUrl(url: string | null): string {
  return url && /^https?:\/\//i.test(url) ? url : '';
}

export default async function EventsPage({ locale, month: monthParam }: { locale: Locale; month?: string }) {
  const c = getContent(locale);
  const EVENTS = c.events;
  const ui = c.ui;
  const loc = ui.dateLocale;
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
    ? new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${month}-01T00:00:00Z`),
      )
    : null;

  const now = new Date();
  const checkedIso = now.toISOString().split('T')[0];
  const checkedLabel = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' }).format(now);

  return (
    <>
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': events.map((ev) => ({
                '@type': 'Event',
                name: ev.title,
                startDate: ev.event_date,
                eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                eventStatus: 'https://schema.org/EventScheduled',
                ...(ev.description ? { description: ev.description } : {}),
                ...(ev.location ? { location: { '@type': 'Place', name: ev.location, address: 'Barcelona, Spain' } } : {}),
                ...(safeUrl(ev.external_url) ? { url: safeUrl(ev.external_url) } : {}),
                organizer: { '@type': 'Organization', name: 'Bizcelona', url: 'https://bizcelona.com/' },
              })),
            }),
          }}
        />
      )}
      <section className="page-head page-head--photo on-navy" aria-labelledby="events-title">
        <div className="page-head__photo par" aria-hidden="true">
          <Picture name="montjuic" sizes={[800, 1600]} sizesAttr="100vw" width={1600} height={900} alt="" priority />
        </div>
        <div className="page-head__veil" aria-hidden="true" />
        <div className="wrap page-head__inner">
          <p className="label">{EVENTS.label}</p>
          <h1 id="events-title">{EVENTS.h1}</h1>
          <p className="lede">{EVENTS.lede}</p>
          <p className="page-head__checked">
            {ui.eventsCheckedPre}<time dateTime={checkedIso}>{checkedLabel}</time>{ui.eventsCheckedPost}
          </p>
        </div>
      </section>

      <section className="section on-light" aria-label={monthLabel ? `${ui.eventsIn}${monthLabel}` : ui.eventsUpcoming}>
        <div className="wrap">
          {monthLabel && (
            <p className="events__filter">
              {ui.eventsFilterShowing}{monthLabel}. <Link className="link-plain" href={localePath(locale, '/events/public')}>{ui.eventsFilterAll}</Link>
            </p>
          )}

          {error ? (
            <div className="empty">
              <h2>{EVENTS.errorTitle}</h2>
              <p className="muted measure">{EVENTS.errorBody}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty">
              <h2>{EVENTS.emptyTitle}</h2>
              <p className="muted measure">{EVENTS.emptyBody}</p>
              <div className="btn-row">
                <Link className="btn btn--navy" href="/signup">{EVENTS.apply}</Link>
              </div>
            </div>
          ) : (
            <ul className="events">
              {events.map((ev) => {
                const when = formatWhen(ev.event_date, loc);
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
                          {ui.rsvp}{platform ? `${ui.rsvpOn}${platform}` : ''}
                          <span className="sr-only">{ui.rsvpFor}{ev.title}{ui.opensNewTab}</span>
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
