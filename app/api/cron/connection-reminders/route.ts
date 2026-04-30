import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bizcelona.com';

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

  const admin = createAdminClient();

  // Find connections older than 48 hours that haven't had a reminder sent yet
  const { data: connections, error: fetchError } = await admin
    .from('connection_requests')
    .select('id, initiator_id, recipient_id, clicked_at')
    .is('reminder_sent_at', null)
    .lt('clicked_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

  if (fetchError) {
    console.error('Failed to fetch connection_requests:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!connections || connections.length === 0) {
    return NextResponse.json({ message: 'No reminders to send', sent: 0 });
  }

  // Gather all unique profile IDs we need to look up
  const allIds = [
    ...new Set([
      ...connections.map((c) => c.initiator_id),
      ...connections.map((c) => c.recipient_id),
    ]),
  ];

  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', allIds);

  if (profilesError) {
    console.error('Failed to fetch profiles:', profilesError);
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  let sent = 0;

  for (const connection of connections) {
    const initiator = profileById.get(connection.initiator_id);
    const recipient = profileById.get(connection.recipient_id);

    if (!initiator?.email || !initiator?.full_name || !recipient?.full_name) {
      console.warn(`Skipping connection ${connection.id} — missing profile data`);
      continue;
    }

    const initiatorFirst = initiator.full_name.split(' ')[0];
    const recipientFirst = recipient.full_name.split(' ')[0];
    const yesUrl = `${APP_URL}/api/connections/confirm?id=${connection.id}&reply=true`;
    const noUrl = `${APP_URL}/api/connections/confirm?id=${connection.id}&reply=false`;

    try {
      await resend.emails.send({
        from: 'Bizcelona <hello@bizcelona.com>',
        to: [initiator.email],
        subject: `Did ${recipientFirst} reply to your Bizcelona message?`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f7fafc; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: #1a202c; padding: 32px 40px; text-align: center; }
                .header h1 { color: #f6ad55; margin: 0; font-size: 22px; }
                .header p { color: #e2e8f0; margin: 8px 0 0; font-size: 14px; }
                .content { padding: 36px 40px; }
                .content p { color: #374151; font-size: 15px; }
                .buttons { display: flex; gap: 12px; justify-content: center; margin: 28px 0; }
                .btn { display: inline-block; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; }
                .btn-yes { background: #f6ad55; color: #1a202c; }
                .btn-no  { background: #e2e8f0; color: #1a202c; }
                .footer { background: #f7fafc; padding: 16px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Bizcelona</h1>
                  <p>A quick follow-up on your connection</p>
                </div>
                <div class="content">
                  <p>Hi ${initiatorFirst},</p>
                  <p>
                    Two days ago you reached out to <strong>${recipient.full_name}</strong> via Bizcelona.
                    Did they get back to you?
                  </p>
                  <p>Tap one of the buttons below — it helps us improve how we match members:</p>
                  <div class="buttons">
                    <a href="${yesUrl}" class="btn btn-yes">Yes, they replied ✓</a>
                    <a href="${noUrl}" class="btn btn-no">Not yet ✗</a>
                  </div>
                  <p style="font-size: 13px; color: #6b7280;">
                    Either way, we appreciate you being part of the Bizcelona community.
                  </p>
                </div>
                <div class="footer">
                  <p>© Bizcelona · Barcelona, Spain</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // Mark reminder as sent
      await admin
        .from('connection_requests')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', connection.id);

      sent++;
    } catch (emailError) {
      console.error(`Failed to send reminder for connection ${connection.id}:`, emailError);
    }
  }

  return NextResponse.json({ sent });
}
