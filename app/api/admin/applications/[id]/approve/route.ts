import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { error } = await supabase.rpc('approve_application', {
    p_application_id: id, p_reviewer_id: user.id,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/application-approved`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ application_id: id }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
