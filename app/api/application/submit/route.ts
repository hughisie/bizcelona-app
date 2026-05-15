import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fullApplicationSchema } from '@/lib/validation/application';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim())
  : ['admin@bizcelona.com'];

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
    industry_other: d.industry_other ?? null,
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
    industry_other: d.industry_other ?? null,
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

  // Notify admins — direct Resend call, no HTTP round-trip
  try {
    const admin = createAdminClient();
    const { data: application } = await admin
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (application) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Bizcelona <hello@bizcelona.com>',
        to: ADMIN_EMAILS,
        subject: `New Application: ${application.full_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #1e3a5f; margin-bottom: 5px; }
                .value { color: #4b5563; }
                .button { display: inline-block; background: #f6ad55; color: #1e3a5f; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">New Bizcelona Application</h1>
                </div>
                <div class="content">
                  <p>A new member has applied to join Bizcelona:</p>
                  <div class="field">
                    <div class="label">Full Name:</div>
                    <div class="value">${application.full_name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${application.email}</div>
                  </div>
                  <div class="field">
                    <div class="label">WhatsApp:</div>
                    <div class="value">${application.whatsapp_number}</div>
                  </div>
                  <div class="field">
                    <div class="label">Business/Role:</div>
                    <div class="value">${application.business_role ?? 'Not provided'}</div>
                  </div>
                  <div class="field">
                    <div class="label">Company:</div>
                    <div class="value">${application.company ?? 'Not provided'}</div>
                  </div>
                  <div class="field">
                    <div class="label">About:</div>
                    <div class="value">${application.message ?? ''}</div>
                  </div>
                  <div class="field">
                    <div class="label">Willing to Contribute:</div>
                    <div class="value">${application.contributor_interest ? 'Yes' : 'No'}</div>
                  </div>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${application.id}" class="button">
                    Review Application
                  </a>
                </div>
                <div class="footer">
                  <p>Bizcelona Admin Notifications</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      if (emailError) {
        // Resend v3+ returns errors as objects rather than throwing
        console.error('[submit] Resend returned error:', JSON.stringify(emailError));
      } else {
        console.log('[submit] Admin notification sent, id:', emailData?.id);
      }
    }
  } catch (notifyErr) {
    // Fallback for unexpected throws
    console.error('[submit] Admin notification failed:', notifyErr);
  }

  return NextResponse.json({ ok: true });
}
