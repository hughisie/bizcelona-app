import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { z } from 'zod';

const patchSchema = z.object({
  group_name: z.string().min(1).max(120).optional(),
  public_url: z.string().min(1).max(200).optional(),
  actual_whatsapp_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
