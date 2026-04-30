import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

/** PUT /api/events/[id] — update event (RLS enforces ownership) */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Strip fields the caller shouldn't be able to set directly
  const { id: _id, organiser_id: _oid, created_at: _ca, ...updateFields } = body;

  const { data: event, error } = await supabase
    .from('events')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // RLS violation returns PGRST116 or a permission error
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ ok: false, error: error.message }, { status });
  }

  return NextResponse.json({ ok: true, data: event });
}

/** DELETE /api/events/[id] — delete event (RLS enforces ownership) */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, success: true });
}
