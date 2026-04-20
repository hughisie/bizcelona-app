import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(['approve', 'reject']),
});

export async function POST(req: Request) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const rpc = parsed.data.action === 'approve' ? 'approve_application' : 'reject_application';
  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const id of parsed.data.ids) {
    const { error } = await supabase.rpc(rpc, { p_application_id: id, p_reviewer_id: user.id });
    results.push({ id, ok: !error, error: error?.message });

    // Fire notifications best-effort after each successful action
    if (!error) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/status-change`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ application_id: id, action: parsed.data.action, reviewer_id: user.id }),
      }).catch(() => {});

      if (parsed.data.action === 'approve') {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/application-approved`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ application_id: id }),
        }).catch(() => {});
      }
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, succeeded: okCount, total: results.length, results });
}
