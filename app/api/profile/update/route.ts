import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  profile: z.object({
    full_name: z.string().min(2).max(120),
    company: z.string().max(120),
    business_role: z.string().max(120),
    industry: z.string(),
    headline: z.string().max(200),
    bio: z.string().max(500),
    whatsapp_number: z.string().max(32),
    linkedin_url: z.string().url().or(z.literal('')),
    show_whatsapp: z.boolean(),
    show_email: z.boolean(),
    show_in_directory: z.boolean(),
  }),
  skills: z.array(z.string().min(1)).max(20),
  help_offered: z.array(z.string().min(1)).max(20),
  help_needed: z.array(z.string().min(1)).max(20),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  const { profile, skills, help_offered, help_needed } = parsed.data;
  const { error: e1 } = await supabase.from('profiles').update(profile).eq('id', user.id);
  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });

  await supabase.from('member_skills').delete().eq('user_id', user.id);
  if (skills.length) await supabase.from('member_skills').insert(skills.map((s) => ({ user_id: user.id, skill_name: s })));

  await supabase.from('help_tags').delete().eq('user_id', user.id);
  const rows = [
    ...help_offered.map((t) => ({ user_id: user.id, direction: 'offered' as const, tag: t })),
    ...help_needed.map((t) => ({ user_id: user.id, direction: 'needed' as const, tag: t })),
  ];
  if (rows.length) await supabase.from('help_tags').insert(rows);

  return NextResponse.json({ ok: true });
}
