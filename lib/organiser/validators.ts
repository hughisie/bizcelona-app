const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type GrantOrganiserBodyError = { ok: false; error: string; status: number };
export type GrantOrganiserBodyOk = { ok: true; userId: string };

/**
 * Validate the request body for the grant-organiser endpoint.
 * Returns the parsed userId on success, or an error descriptor on failure.
 */
export function validateGrantOrganiserBody(
  body: unknown
): GrantOrganiserBodyOk | GrantOrganiserBodyError {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON', status: 400 };
  }
  const { userId } = body as Record<string, unknown>;
  if (!userId || typeof userId !== 'string') {
    return { ok: false, error: 'userId is required', status: 400 };
  }
  if (!uuidRegex.test(userId)) {
    return { ok: false, error: 'userId must be a valid UUID', status: 400 };
  }
  return { ok: true, userId };
}
