import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { isUserOrganiser } from '@/lib/organiser';

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

/** GET /api/events — list events */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM
  const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

  const supabase = await createClient();

  // If caller wants unpublished, verify they're admin or organiser
  let allowUnpublished = false;
  if (includeUnpublished) {
    allowUnpublished = (await isUserAdmin()) || (await isUserOrganiser());
  }

  let query = supabase
    .from('events')
    .select(
      'id, slug, title, description, event_date, end_date, location, cover_image_url, external_url, platform, category, organiser_id, is_published'
    )
    .order('event_date', { ascending: true });

  if (!allowUnpublished) {
    // RLS also enforces this for anon, but be explicit
    query = query.eq('is_published', true);
  }

  if (month) {
    // Filter to events where event_date is within the given month
    const [year, mon] = month.split('-');
    const from = `${year}-${mon}-01`;
    // End of month: first day of next month
    const nextMonth = parseInt(mon, 10) === 12
      ? `${parseInt(year, 10) + 1}-01-01`
      : `${year}-${String(parseInt(mon, 10) + 1).padStart(2, '0')}-01`;
    query = query.gte('event_date', from).lt('event_date', nextMonth);
  } else {
    // Default: upcoming events only
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('event_date', today);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

/** POST /api/events — create event (organiser or admin only) */
export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  const isAdminUser = await isUserAdmin();
  const isOrganiserUser = await isUserOrganiser();
  if (!isAdminUser && !isOrganiserUser) {
    return NextResponse.json({ ok: false, error: 'Forbidden — organiser or admin role required' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, description, event_date, end_date, location, cover_image_url, external_url, platform, category, is_published } = body;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
  }
  if (!event_date || typeof event_date !== 'string') {
    return NextResponse.json({ ok: false, error: 'event_date is required' }, { status: 400 });
  }
  if (!external_url || typeof external_url !== 'string') {
    return NextResponse.json({ ok: false, error: 'external_url is required' }, { status: 400 });
  }
  if (!platform || typeof platform !== 'string') {
    return NextResponse.json({ ok: false, error: 'platform is required' }, { status: 400 });
  }
  if (!category || typeof category !== 'string') {
    return NextResponse.json({ ok: false, error: 'category is required' }, { status: 400 });
  }

  const slug = generateSlug(title as string);

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: title as string,
      slug,
      description: (description as string | null) ?? null,
      event_date: event_date as string,
      end_date: (end_date as string | null) ?? null,
      location: (location as string | null) ?? null,
      cover_image_url: (cover_image_url as string | null) ?? null,
      external_url: external_url as string,
      platform: platform as string,
      category: category as string,
      is_published: typeof is_published === 'boolean' ? is_published : false,
      organiser_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data: event }, { status: 201 });
}
