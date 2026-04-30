import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ userId: string }> };

/** DELETE /api/admin/organiser-roles/[userId] — revoke organiser role */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { error, count } = await supabase
    .from('organiser_roles')
    .delete({ count: 'exact' })
    .eq('user_id', userId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (count === 0) return NextResponse.json({ ok: false, error: 'User is not an organiser' }, { status: 404 });

  return NextResponse.json({ ok: true, success: true });
}
