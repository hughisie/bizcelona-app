import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { z } from 'zod';

const createSchema = z.object({
  group_name: z.string().min(1).max(120),
  public_url: z.string().min(1).max(200),
  actual_whatsapp_url: z.string().url(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data } = await supabase.from('whatsapp_links').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').insert(parsed.data);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
