import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  application_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reviewer_id: z.string().uuid(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();

  // Fetch application + reviewer in parallel
  const [{ data: app }, { data: reviewer }] = await Promise.all([
    supabase.from('applications').select('full_name, email, company, business_role').eq('id', parsed.data.application_id).maybeSingle(),
    supabase.from('profiles').select('full_name, email').eq('id', parsed.data.reviewer_id).maybeSingle(),
  ]);

  if (!app) return NextResponse.json({ ok: false }, { status: 404 });

  const admins = (process.env.ADMIN_EMAIL ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (admins.length === 0) return NextResponse.json({ ok: true, note: 'no admins configured' });

  const verb = parsed.data.action === 'approve' ? 'Approved' : 'Rejected';

  const { error } = await resend.emails.send({
    from: 'Bizcelona <info@bizcelona.com>',
    to: admins,
    subject: `${verb}: ${app.full_name} (${app.company ?? '—'})`,
    html: `
      <div style="font-family: -apple-system, Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a202c;">
        <h2 style="margin: 0 0 8px;">${verb} application</h2>
        <p style="margin: 0 0 6px;"><b>${app.full_name}</b> &lt;${app.email}&gt;</p>
        <p style="margin: 0 0 16px; color: #64748b;">${app.business_role ?? ''}${app.company ? ' at ' + app.company : ''}</p>
        <p style="margin: 0; color: #64748b; font-size: 13px;">Reviewed by ${reviewer?.full_name ?? reviewer?.email ?? 'an admin'}.</p>
      </div>
    `,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
