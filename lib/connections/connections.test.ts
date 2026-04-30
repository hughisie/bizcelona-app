/**
 * Tests for connection tracking logic.
 *
 * These test the validation and business rules independently of Next.js
 * runtime, following the same pattern as application.test.ts / onboarding.test.ts.
 */
import { describe, it, expect } from 'vitest';

// -----------------------------------------------------------------------
// Shared helpers (same logic used in the track and confirm route handlers)
// -----------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateTrackRequest(body: unknown): { ok: true; recipientId: string } | { ok: false; error: string; status: number } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON', status: 400 };
  }
  const { recipientId } = body as Record<string, unknown>;
  if (!recipientId || typeof recipientId !== 'string' || !UUID_RE.test(recipientId)) {
    return { ok: false, error: 'recipientId must be a valid UUID', status: 400 };
  }
  return { ok: true, recipientId };
}

function validateConfirmRequest(id: string | null, reply: string | null): { ok: true; replyValue: boolean } | { ok: false; error: string; status: number } {
  if (!id || !UUID_RE.test(id)) {
    return { ok: false, error: 'Invalid id', status: 400 };
  }
  if (reply !== 'true' && reply !== 'false') {
    return { ok: false, error: 'reply must be "true" or "false"', status: 400 };
  }
  return { ok: true, replyValue: reply === 'true' };
}

// -----------------------------------------------------------------------
// /api/connections/track — validation
// -----------------------------------------------------------------------

describe('track request validation', () => {
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  it('accepts a valid recipientId', () => {
    const result = validateTrackRequest({ recipientId: VALID_UUID });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.recipientId).toBe(VALID_UUID);
  });

  it('rejects missing recipientId', () => {
    const result = validateTrackRequest({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/uuid/i);
    }
  });

  it('rejects a non-UUID string', () => {
    const result = validateTrackRequest({ recipientId: 'not-a-uuid' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it('rejects an empty string', () => {
    const result = validateTrackRequest({ recipientId: '' });
    expect(result.ok).toBe(false);
  });

  it('rejects a null body', () => {
    const result = validateTrackRequest(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it('accepts uppercase UUID (case-insensitive)', () => {
    const upper = VALID_UUID.toUpperCase();
    const result = validateTrackRequest({ recipientId: upper });
    expect(result.ok).toBe(true);
  });
});

// -----------------------------------------------------------------------
// /api/connections/confirm — validation
// -----------------------------------------------------------------------

describe('confirm request validation', () => {
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  it('accepts id + reply=true and returns replyValue=true', () => {
    const result = validateConfirmRequest(VALID_UUID, 'true');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.replyValue).toBe(true);
  });

  it('accepts id + reply=false and returns replyValue=false', () => {
    const result = validateConfirmRequest(VALID_UUID, 'false');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.replyValue).toBe(false);
  });

  it('rejects a missing (null) id', () => {
    const result = validateConfirmRequest(null, 'true');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it('rejects an invalid id', () => {
    const result = validateConfirmRequest('not-a-uuid', 'true');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it('rejects reply values other than "true" or "false"', () => {
    const result = validateConfirmRequest(VALID_UUID, 'yes');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/true.*false|false.*true/i);
    }
  });

  it('rejects null reply', () => {
    const result = validateConfirmRequest(VALID_UUID, null);
    expect(result.ok).toBe(false);
  });

  it('rejects empty string reply', () => {
    const result = validateConfirmRequest(VALID_UUID, '');
    expect(result.ok).toBe(false);
  });
});
