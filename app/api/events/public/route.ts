import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** OPTIONS — handle CORS preflight */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** GET /api/events/public — published events only, CORS-open for the static marketing site */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM

  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select(
      'id, slug, title, description, event_date, end_date, location, cover_image_url, external_url, platform, category, organiser_id, is_published'
    )
    .eq('is_published', true)
    .order('event_date', { ascending: true });

  if (month) {
    const [year, mon] = month.split('-');
    const from = `${year}-${mon}-01`;
    const nextMonth =
      parseInt(mon, 10) === 12
        ? `${parseInt(year, 10) + 1}-01-01`
        : `${year}-${String(parseInt(mon, 10) + 1).padStart(2, '0')}-01`;
    query = query.gte('event_date', from).lt('event_date', nextMonth);
  } else {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('event_date', today);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json({ ok: true, data }, { headers: CORS_HEADERS });
}
