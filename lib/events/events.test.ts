/**
 * Tests for events backend validation helpers.
 *
 * These test validation logic independently of Next.js runtime,
 * following the same pattern as connections.test.ts / application.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { validateEventUrl } from './fetch-url';

// -----------------------------------------------------------------------
// /api/events/fetch-url — URL validation
// -----------------------------------------------------------------------

describe('validateEventUrl', () => {
  it('accepts a valid Luma URL (lu.ma)', () => {
    const result = validateEventUrl('https://lu.ma/some-event');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.platform).toBe('luma');
    }
  });

  it('accepts a valid Luma URL (luma.co)', () => {
    const result = validateEventUrl('https://luma.co/some-event');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.platform).toBe('luma');
    }
  });

  it('accepts a valid Eventbrite URL', () => {
    const result = validateEventUrl('https://www.eventbrite.com/e/some-event-12345');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.platform).toBe('eventbrite');
    }
  });

  it('accepts a valid Meetup URL', () => {
    const result = validateEventUrl('https://www.meetup.com/barcelona-tech/events/12345');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.platform).toBe('meetup');
    }
  });

  it('accepts an unknown URL and marks platform as other', () => {
    const result = validateEventUrl('https://some-random-site.com/event/123');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.platform).toBe('other');
    }
  });

  it('rejects a completely invalid URL string', () => {
    const result = validateEventUrl('not-a-url');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
    }
  });

  it('rejects a non-string input', () => {
    const result = validateEventUrl(12345);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects null input', () => {
    const result = validateEventUrl(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects empty string', () => {
    const result = validateEventUrl('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects non-http protocols', () => {
    const result = validateEventUrl('ftp://lu.ma/event');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
    }
  });
});

// -----------------------------------------------------------------------
// /api/admin/organiser-roles — grant validation helpers
// -----------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateGrantOrganiserBody(
  body: unknown
): { ok: true; userId: string } | { ok: false; error: string; status: number } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON', status: 400 };
  }
  const { userId } = body as Record<string, unknown>;
  if (!userId || typeof userId !== 'string') {
    return { ok: false, error: 'userId is required', status: 400 };
  }
  // Accept any non-empty string — UUID validation happens at DB level via FK
  return { ok: true, userId };
}

describe('validateGrantOrganiserBody', () => {
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  it('accepts a valid userId UUID', () => {
    const result = validateGrantOrganiserBody({ userId: VALID_UUID });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.userId).toBe(VALID_UUID);
  });

  it('rejects missing userId', () => {
    const result = validateGrantOrganiserBody({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/userId/i);
    }
  });

  it('rejects null body', () => {
    const result = validateGrantOrganiserBody(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects non-object body', () => {
    const result = validateGrantOrganiserBody('just-a-string');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects userId as a number', () => {
    const result = validateGrantOrganiserBody({ userId: 12345 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it('rejects empty string userId', () => {
    const result = validateGrantOrganiserBody({ userId: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });
});
