import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';

/** POST /api/admin/organiser-roles — grant organiser role to a user */
export async function POST(req: Request) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId } = (body as Record<string, unknown>) ?? {};

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 });
  }

  // Verify the user exists in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('organiser_roles')
    .insert({ user_id: userId, granted_by: user!.id });

  if (error) {
    // Unique constraint violation — already an organiser
    if (error.code === '23505') {
      return NextResponse.json({ ok: false, error: 'User is already an organiser' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, success: true }, { status: 201 });
}
