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
  const supabase = await createClient();

  // Trigger Supabase's signup confirmation email (templated as "Bizcelona - Confirm Your Email").
  // This creates an UNCONFIRMED user and sends the email via Supabase/Resend.
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-confirm?type=signup`,
      data: { full_name },
    },
  });

  // "User already registered" → fall through and try to sign them in.
  const alreadyRegistered = signUpErr && /already|exists|registered/i.test(signUpErr.message);
  if (signUpErr && !alreadyRegistered) {
    return NextResponse.json({ ok: false, error: signUpErr.message }, { status: 400 });
  }

  const userId = signUpData?.user?.id;
  const admin = createAdminClient();

  // Auto-confirm server-side so signInWithPassword succeeds for the wizard session.
  // The user still receives (and can still click) the confirmation email; /auth-confirm
  // handles "already confirmed" gracefully.
  if (userId) {
    await admin.auth.admin.updateUserById(userId, { email_confirm: true });
    await admin.from('profiles').update({ full_name }).eq('id', userId);
  }

  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    return NextResponse.json({ ok: false, error: signInErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
