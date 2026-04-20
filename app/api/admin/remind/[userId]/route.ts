import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.email) return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });

  const firstName = (profile.full_name ?? '').split(' ')[0] || 'there';
  const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup`;

  const { error } = await resend.emails.send({
    from: 'Bizcelona <info@bizcelona.com>',
    to: profile.email,
    subject: 'Finish your Bizcelona application',
    html: `
      <div style="font-family: -apple-system, Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #1a202c;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Hi ${firstName},</h1>
        <p style="line-height: 1.5; margin: 0 0 16px;">We noticed you signed up to join Bizcelona but haven't finished your application yet. It takes about five minutes.</p>
        <p style="margin: 0 0 24px;">
          <a href="${signupUrl}" style="display:inline-block; background: #f6ad55; color: #1a202c; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Finish your application</a>
        </p>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Curated WhatsApp community for entrepreneurs, freelancers, and senior professionals in Barcelona. No charge — the value comes from members showing up for each other.</p>
      </div>
    `,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
