import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-confirm`,
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (userId) {
    // Trigger handle_new_user should have created profile row; set full_name.
    await supabase.from('profiles').update({ full_name: parsed.data.full_name }).eq('id', userId);
  }

  return NextResponse.json({ ok: true });
}
