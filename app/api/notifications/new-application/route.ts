import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);
// Support multiple admin emails separated by comma
const ADMIN_EMAILS = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
  : ['admin@bizcelona.com'];

export async function POST(request: NextRequest) {
  try {
    // Internal server-to-server call — no user session available.
    // Use the admin client (service role) to bypass RLS.
    const admin = createAdminClient();

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Fetch the most recent application for this user
    const { data: application, error: appError } = await admin
      .from('applications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Send email to all admin emails
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
                <h1 style="margin: 0;">🎯 New Bizcelona Application</h1>
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
                  <div class="value">${application.business_role}</div>
                </div>

                <div class="field">
                  <div class="label">Company:</div>
                  <div class="value">${application.company || 'Not provided'}</div>
                </div>

                <div class="field">
                  <div class="label">About:</div>
                  <div class="value">${application.message}</div>
                </div>

                <div class="field">
                  <div class="label">Willing to Contribute:</div>
                  <div class="value">${application.contributor_interest ? 'Yes ✅' : 'No'}</div>
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
      console.error('[new-application] Resend returned error:', JSON.stringify(emailError));
      return NextResponse.json({ error: 'Failed to send email', detail: emailError }, { status: 500 });
    }

    console.log('[new-application] Admin notification sent, id:', emailData?.id);
    return NextResponse.json({ success: true, data: emailData });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
