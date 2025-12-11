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

    // Fetch user profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Send email to all admin emails
    const emailData = await resend.emails.send({
      from: 'Bizcelona <notifications@bizcelona.com>',
      to: ADMIN_EMAILS,
      subject: `New User Signup: ${profile.full_name || user.email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1e3a5f; margin-bottom: 5px; }
              .value { color: #4b5563; }
              .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">👋 New User Signup</h1>
              </div>
              <div class="content">
                <p><span class="badge">NEW ACCOUNT</span></p>
                <p>A new user has created an account on Bizcelona:</p>

                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${profile.full_name || 'Not provided yet'}</div>
                </div>

                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${user.email}</div>
                </div>

                <div class="field">
                  <div class="label">Created:</div>
                  <div class="value">${new Date(profile.created_at).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>

                <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                  <strong>⏳ Next Step:</strong> This user will likely complete their membership application soon.
                </p>
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
