import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fullApplicationSchema } from '@/lib/validation/application';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = fullApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  // Living record — profiles is the source of truth for the member's current state
  const profileUpdate = {
    full_name: d.full_name,
    company: d.company,
    business_role: d.business_role,
    industry: d.industry,
    headline: d.headline,
    whatsapp_number: d.whatsapp_number,
    linkedin_url: d.linkedin_url,
  };
  const { error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
  if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

  // Immutable application snapshot — populate BOTH new columns and legacy NOT NULL ones from migration 00004
  const applicationRow = {
    user_id: user.id,
    // Basic required fields
    full_name: d.full_name,
    email: d.email,
    whatsapp_number: d.whatsapp_number,
    // New columns (added in migration 00009)
    company: d.company,
    business_role: d.business_role,
    industry: d.industry,
    linkedin_url: d.linkedin_url,
    hopes_to_get: d.hopes_to_get,
    hopes_to_bring: d.hopes_to_bring,
    contributor_interest: d.contributor_interest,
    heard_from: d.heard_from,
    additional_info: d.additional_info ?? null,
    consent_guidelines: d.consent_guidelines,
    consent_privacy: d.consent_privacy,
    consent_contact: d.consent_contact,
    consent_selective: d.consent_selective,
    consent_directory: d.consent_directory,
    // Legacy NOT NULL columns from migration 00004 — mirror the new values
    hope_to_bring: d.hopes_to_bring,
    hoping_to_get: d.hopes_to_get,
    how_heard_about: d.heard_from,
    industry_sector: d.industry,
    linkedin_profile: d.linkedin_url,
    what_do_you_do: d.headline,
    message: d.hopes_to_get,
    status: 'submitted' as const,
  };

  const { error: aErr } = await supabase.from('applications').upsert(applicationRow, { onConflict: 'user_id' });
  if (aErr) return NextResponse.json({ ok: false, error: aErr.message }, { status: 500 });

  // Ensure members row in 'pending'
  await supabase.from('members').upsert({ user_id: user.id, status: 'pending' }, { onConflict: 'user_id' });

  // Notify admins (best-effort)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/new-application`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: user.id }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
