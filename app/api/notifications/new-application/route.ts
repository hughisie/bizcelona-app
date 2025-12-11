import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);
// Support multiple admin emails separated by comma
const ADMIN_EMAILS = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
  : ['admin@bizcelona.com'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify the request is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId } = body;

    // Fetch application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Send email to all admin emails
    const emailData = await resend.emails.send({
      from: 'Bizcelona <notifications@bizcelona.com>',
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
                  <div class="label">Phone:</div>
                  <div class="value">${application.phone_number || 'Not provided'}</div>
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

    return NextResponse.json({ success: true, data: emailData });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
