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

const ALLOWED_HOSTNAMES: Record<string, EventPlatform> = {
  'lu.ma': 'luma',
  'luma.co': 'luma',
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

/** Extract structured data (application/ld+json) from HTML, returns first parsed object or null */
export function extractStructuredData(html: string): Record<string, unknown> | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const m = html.match(re);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]);
    // Could be an array or single object
    if (Array.isArray(parsed)) return parsed[0] ?? null;
    return parsed;
  } catch {
    return null;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseEventDataFromHtml(html: string, platform: EventPlatform): FetchedEventData {
  const title = extractMetaContent(html, 'og:title');
  const description = extractMetaContent(html, 'og:description');
  const coverImageUrl = extractMetaContent(html, 'og:image');

  // Try OG date fields first, then fall back to structured data
  let eventDate = extractMetaContent(html, 'og:start_time')
    ?? extractMetaContent(html, 'article:published_time');

  let endDate = extractMetaContent(html, 'og:end_time')
    ?? extractMetaContent(html, 'article:expiration_time');

  // Fall back to LD+JSON structured data
  if (!eventDate || !endDate) {
    const ld = extractStructuredData(html);
    if (ld) {
      if (!eventDate && typeof ld.startDate === 'string') {
        eventDate = ld.startDate;
      }
      if (!endDate && typeof ld.endDate === 'string') {
        endDate = ld.endDate;
      }
    }
  }

  // Location: try og:location first, then LD+JSON location.name
  let location = extractMetaContent(html, 'og:location');
  if (!location) {
    const ld = extractStructuredData(html);
    if (ld) {
      const loc = ld.location as Record<string, unknown> | undefined;
      if (loc && typeof loc.name === 'string') {
        location = loc.name;
      } else if (loc && typeof loc.address === 'string') {
        location = loc.address;
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
