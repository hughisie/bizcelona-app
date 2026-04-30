'use client';

export type EventCardEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  cover_image_url: string | null;
  external_url: string;
  platform: string;
  category: string;
  organiser_id: string;
  is_published: boolean;
};

export type EventCardProps = {
  event: EventCardEvent;
  canEdit?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (event: EventCardEvent) => void;
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  networking: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  workshop:   { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  social:     { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  other:      { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

const PLATFORM_LABELS: Record<string, string> = {
  luma:       'via Luma',
  eventbrite: 'via Eventbrite',
  meetup:     'via Meetup',
  other:      'via Website',
};

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(d);
  const dayNum = d.getDate();
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(d);
  const time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  // e.g. "Tuesday 12 May · 7:00 pm" — capitalise am/pm to match common style
  return `${dayName} ${dayNum} ${month} · ${time.toUpperCase().replace(' ', ' ')}`;
}

export function EventCard({ event, canEdit = false, onDelete, onEdit }: EventCardProps) {
  const catStyle = CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES.other;
  const platformLabel = PLATFORM_LABELS[event.platform] ?? 'via Website';

  const coverEl = event.cover_image_url ? (
    <img
      src={event.cover_image_url}
      alt=""
      loading="lazy"
      className="w-full h-40 object-cover"
    />
  ) : (
    <div className="w-full h-40 bg-gradient-to-br from-navy to-navy/70 flex items-center justify-center">
      <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
        {event.category}
      </span>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-saffron hover:shadow-sm transition group">
      {/* Cover image / placeholder */}
      <div className="relative">
        {coverEl}
        {/* Edit controls — top-right corner overlay */}
        {canEdit && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-1.5 bg-white/90 rounded-lg shadow text-gray-600 hover:text-navy transition"
                aria-label="Edit event"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${event.title}"?`)) onDelete(event.id);
                }}
                className="p-1.5 bg-white/90 rounded-lg shadow text-gray-600 hover:text-red-600 transition"
                aria-label="Delete event"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
        {/* Unpublished badge */}
        {!event.is_published && canEdit && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800/80 text-white text-[10px] font-medium rounded uppercase tracking-wide">
            Draft
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${catStyle.bg} ${catStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
            {platformLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-navy text-base leading-snug">{event.title}</h3>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-saffron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatEventDate(event.event_date)}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-saffron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{event.description}</p>
        )}

        {/* RSVP button */}
        <a
          href={event.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-saffron text-navy font-semibold text-sm rounded-lg hover:bg-saffron/90 transition self-start"
        >
          RSVP
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
