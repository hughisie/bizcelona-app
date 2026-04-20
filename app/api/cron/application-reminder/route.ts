import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Vercel cron jobs call with a secret to prevent abuse
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // allow if not set (local dev)
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Find profiles created between 48 and 72 hours ago (send reminder once in that window)
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .gte('created_at', seventyTwoHoursAgo.toISOString())
      .lte('created_at', fortyEightHoursAgo.toISOString());

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No profiles in reminder window', sent: 0 });
    }

    // Get IDs of profiles that have already submitted an application
    const profileIds = profiles.map((p) => p.id);
    const { data: existingApplications } = await supabase
      .from('applications')
      .select('user_id')
      .in('user_id', profileIds);

    const appliedIds = new Set((existingApplications || []).map((a) => a.user_id));
    const needsReminder = profiles.filter((p) => !appliedIds.has(p.id));

    if (needsReminder.length === 0) {
      return NextResponse.json({ message: 'All users in window have applied', sent: 0 });
    }

    const applyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.bizcelona.com'}/signup`;
    let sent = 0;
    const errors: string[] = [];

    for (const profile of needsReminder) {
      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';

      try {
        await resend.emails.send({
          from: 'Bizcelona <info@bizcelona.com>',
          to: [profile.email],
          subject: `${firstName}, don't forget to complete your Bizcelona application`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f0e8; }
                  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                  .header { background: #1e3a5f; padding: 36px 40px; text-align: center; }
                  .header h1 { color: white; margin: 0; font-size: 26px; }
                  .content { padding: 40px; }
                  .cta { text-align: center; margin: 32px 0; }
                  .cta a { display: inline-block; background: #f59e0b; color: #1e3a5f; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 17px; font-weight: 700; }
                  .note { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 4px; font-size: 14px; color: #166534; margin-top: 24px; }
                  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Your application is waiting, ${firstName}</h1>
                  </div>
                  <div class="content">
                    <p style="font-size: 16px; color: #374151;">
                      You created your Bizcelona account 2 days ago but haven't yet completed your membership application.
                    </p>
                    <p style="color: #374151;">
                      Bizcelona is Barcelona's invite-only community for entrepreneurs, senior executives, and digital nomads. Membership is curated and limited — we'd love to consider your application.
                    </p>
                    <p style="color: #374151;">
                      The application takes around <strong>10 minutes</strong> to complete.
                    </p>

                    <div class="cta">
                      <a href="${applyUrl}">Complete My Application →</a>
                    </div>

                    <div class="note">
                      <strong>Already applied?</strong> You can ignore this email — our team will be in touch within 3–5 days.
                    </div>
                  </div>
                  <div class="footer">
                    <p>© Bizcelona · Barcelona, Spain</p>
                    <p>You're receiving this because you created an account at bizcelona.com.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        sent++;
      } catch (emailError: any) {
        console.error(`Failed to send reminder to ${profile.email}:`, emailError);
        errors.push(profile.email);
      }
    }

    return NextResponse.json({
      message: `Sent ${sent} reminder(s)`,
      sent,
      skipped: profiles.length - needsReminder.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
