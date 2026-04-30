import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateEventUrl, parseEventDataFromHtml } from '@/lib/events/fetch-url';

const FETCH_TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  // Must be signed in
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const rawUrl = (body as Record<string, unknown>)?.url;
  const validation = validateEventUrl(rawUrl);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: validation.status });
  }

  const { url, platform } = validation;

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          // Pretend to be a browser so pages serve OpenGraph meta tags
          'User-Agent': 'Mozilla/5.0 (compatible; Bizcelona-EventBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: `Remote page returned ${response.status}` },
          { status: 422 }
        );
      }
      html = await response.text();
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      { ok: false, error: isTimeout ? 'Request timed out after 10s' : 'Failed to fetch URL' },
      { status: 422 }
    );
  }

  const data = parseEventDataFromHtml(html, platform);

  return NextResponse.json({ ok: true, data });
}
