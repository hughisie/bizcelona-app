/**
 * Shared validation and parsing logic for the fetch-url route.
 * Extracted here so it can be tested independently of Next.js runtime.
 */

export type EventPlatform = 'luma' | 'eventbrite' | 'meetup' | 'other';

export interface FetchedEventData {
  title: string | null;
  description: string | null;
  coverImageUrl: string | null;
  eventDate: string | null;
  endDate: string | null;
  location: string | null;
  platform: EventPlatform;
}

export type UrlValidationResult =
  | { ok: true; url: URL; platform: EventPlatform }
  | { ok: false; error: string; status: number };

export const ALLOWED_HOSTNAMES: Record<string, EventPlatform> = {
  'lu.ma': 'luma',
  'luma.co': 'luma',
  'luma.com': 'luma',
  'www.luma.com': 'luma',
  'www.eventbrite.com': 'eventbrite',
  'eventbrite.com': 'eventbrite',
  'www.eventbrite.co.uk': 'eventbrite',
  'www.eventbrite.es': 'eventbrite',
  'www.meetup.com': 'meetup',
  'meetup.com': 'meetup',
};

export function validateEventUrl(raw: unknown): UrlValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'url must be a non-empty string', status: 400 };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: 'url is not a valid URL', status: 422 };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, error: 'url must use http or https', status: 422 };
  }

  const hostname = parsed.hostname.toLowerCase();
  const platform = ALLOWED_HOSTNAMES[hostname];

  // If platform not matched, treat as 'other' — allowed but clearly labelled
  return { ok: true, url: parsed, platform: platform ?? 'other' };
}

/** Extract a single <meta> tag content value from raw HTML */
export function extractMetaContent(html: string, property: string): string | null {
  // Matches both property= and name= variants, single or double quotes
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegex(property)}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1];

  // Also try content= before property= ordering
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegex(property)}["']`,
    'i'
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

/**
 * Extract structured data (application/ld+json) from HTML.
 * Scans ALL script blocks and prefers the one with @type === 'Event'.
 * Eventbrite embeds multiple LD+JSON blocks; the Event schema (with startDate,
 * endDate, location) is typically not the first one.
 */
export function extractStructuredData(html: string): Record<string, unknown> | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const candidates: Record<string, unknown>[] = [];

  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed: unknown = JSON.parse(m[1]);
      const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          candidates.push(item as Record<string, unknown>);
        }
      }
    } catch {
      // skip malformed blocks
    }
  }

  if (candidates.length === 0) return null;

  // Prefer a block where @type is 'Event' (or an array containing 'Event')
  const eventBlock = candidates.find(c => {
    const t = c['@type'];
    if (typeof t === 'string') return t === 'Event' || t.includes('Event');
    if (Array.isArray(t)) return (t as unknown[]).some(
      v => typeof v === 'string' && (v === 'Event' || v.includes('Event'))
    );
    return false;
  });

  return eventBlock ?? candidates[0] ?? null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseEventDataFromHtml(html: string, platform: EventPlatform): FetchedEventData {
  const title = extractMetaContent(html, 'og:title');
  const description = extractMetaContent(html, 'og:description');
  const coverImageUrl = extractMetaContent(html, 'og:image');

  // Extract LD+JSON once (prefers the Event-typed block — see extractStructuredData)
  const ld = extractStructuredData(html);

  // Try OG date fields first, then fall back to LD+JSON
  let eventDate: string | null =
    extractMetaContent(html, 'og:start_time') ??
    extractMetaContent(html, 'article:published_time') ??
    null;
  if (!eventDate && ld && typeof ld.startDate === 'string') {
    eventDate = ld.startDate;
  }

  let endDate: string | null =
    extractMetaContent(html, 'og:end_time') ??
    extractMetaContent(html, 'article:expiration_time') ??
    null;
  if (!endDate && ld && typeof ld.endDate === 'string') {
    endDate = ld.endDate;
  }

  // Location: try og:location first, then LD+JSON location object
  let location: string | null = extractMetaContent(html, 'og:location');
  if (!location && ld) {
    const loc = ld.location as Record<string, unknown> | string | undefined;
    if (typeof loc === 'string') {
      location = loc;
    } else if (loc && typeof loc === 'object') {
      // Schema.org Place: prefer name, then address.streetAddress, then address (string)
      if (typeof loc.name === 'string') {
        location = loc.name;
      } else {
        const addr = loc.address as Record<string, unknown> | string | undefined;
        if (typeof addr === 'string') {
          location = addr;
        } else if (addr && typeof addr === 'object') {
          const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion]
            .filter((p): p is string => typeof p === 'string' && p.length > 0);
          if (parts.length > 0) location = parts.join(', ');
        }
      }
    }
  }

  return {
    title,
    description,
    coverImageUrl,
    eventDate,
    endDate,
    location,
    platform,
  };
}
