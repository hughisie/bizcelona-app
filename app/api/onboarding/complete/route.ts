import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { welcomeSchema } from '@/lib/validation/onboarding';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = welcomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 });
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  // Bio + privacy toggles + mark onboarding done. profile_picture_url was set by the avatar endpoint.
  const { error: pErr } = await supabase.from('profiles').update({
    bio: d.bio,
    show_whatsapp: d.show_whatsapp,
    show_email: d.show_email,
    show_in_directory: d.show_in_directory,
    onboarding_completed_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

  // Replace skills
  await supabase.from('member_skills').delete().eq('user_id', user.id);
  if (d.skills.length) {
    await supabase.from('member_skills').insert(d.skills.map((s) => ({ user_id: user.id, skill_name: s })));
  }

  // Replace help tags
  await supabase.from('help_tags').delete().eq('user_id', user.id);
  const rows = [
    ...d.help_offered.map((t) => ({ user_id: user.id, direction: 'offered' as const, tag: t })),
    ...d.help_needed.map((t) => ({ user_id: user.id, direction: 'needed' as const, tag: t })),
  ];
  if (rows.length) await supabase.from('help_tags').insert(rows);

  return NextResponse.json({ ok: true });
}
