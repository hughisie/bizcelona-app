import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const { data: skills } = await supabase.from('member_skills').select('skill_name').eq('user_id', user.id);
  const { data: help } = await supabase.from('help_tags').select('direction, tag').eq('user_id', user.id);
  return NextResponse.json({
    ok: true,
    profile,
    skills: (skills ?? []).map(s => s.skill_name),
    help_offered: (help ?? []).filter(h => h.direction === 'offered').map(h => h.tag),
    help_needed: (help ?? []).filter(h => h.direction === 'needed').map(h => h.tag),
  });
}
