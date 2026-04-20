import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Max 2MB' }, { status: 400 });

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase.storage.from('profile-pictures').upload(path, file, {
    upsert: true, contentType: file.type,
  });
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('profile-pictures').getPublicUrl(path);
  const cacheBusted = `${pub.publicUrl}?v=${Date.now()}`;

  await supabase.from('profiles').update({ profile_picture_url: cacheBusted }).eq('id', user.id);
  return NextResponse.json({ ok: true, url: cacheBusted });
}
