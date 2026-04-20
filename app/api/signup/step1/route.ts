import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { step1Schema } from '@/lib/validation/application';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = step1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { email, password, full_name } = parsed.data;
  const admin = createAdminClient();

  // Create a pre-confirmed user so they get a session immediately.
  // Email confirmation is a notification (sent below), not a gate.
  const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createErr) {
    // If the user already exists, fall through and try signInWithPassword below.
    const already = /already been registered|User already registered/i.test(createErr.message);
    if (!already) {
      return NextResponse.json({ ok: false, error: createErr.message }, { status: 400 });
    }
  }

  const userId = createdUser?.user?.id;
  if (userId) {
    // handle_new_user trigger creates the profile row; set full_name explicitly.
    await admin.from('profiles').update({ full_name }).eq('id', userId);
  }

  // Sign in with the anon client so session cookies are set on the response.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    return NextResponse.json({ ok: false, error: signInErr.message }, { status: 400 });
  }

  // Fire welcome/admin notification email (best-effort, non-blocking).
  // The endpoint expects { userId, email, fullName, whatsappNumber }.
  // whatsappNumber is not available at step 1 — omitted; endpoint handles it gracefully.
  if (userId) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/new-user`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, email, fullName: full_name }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
