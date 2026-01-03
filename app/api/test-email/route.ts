import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
  : ['admin@bizcelona.com'];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check authentication
    if (!user) {
      return NextResponse.json({
        error: 'Unauthorized - You must be logged in to test emails',
        authenticated: false
      }, { status: 401 });
    }

    // Check environment variables
    const diagnostics = {
      timestamp: new Date().toISOString(),
      authenticated: true,
      user_email: user.email,
      environment_check: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set (length: ' + process.env.RESEND_API_KEY.length + ')' : '❌ Missing',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '✅ Set: ' + process.env.ADMIN_EMAIL : '❌ Missing',
        ADMIN_EMAILS_PARSED: ADMIN_EMAILS,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing'
      }
    };

    // Try to send test email
    try {
      const emailData = await resend.emails.send({
        from: 'Bizcelona <onboarding@resend.dev>',
        to: ADMIN_EMAILS,
        subject: '🧪 Test Email - Bizcelona Notification System',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .success { background: #10b981; color: white; padding: 20px; border-radius: 8px; }
                .info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                pre { background: #1f2937; color: #10b981; padding: 10px; border-radius: 4px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success">
                  <h1 style="margin: 0;">✅ Email System Working!</h1>
                </div>

                <div class="info">
                  <h2>Test Details:</h2>
                  <p><strong>Triggered by:</strong> ${user.email}</p>
                  <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Admin emails:</strong> ${ADMIN_EMAILS.join(', ')}</p>
                </div>

                <div class="info">
                  <h2>Environment Status:</h2>
                  <pre>${JSON.stringify(diagnostics.environment_check, null, 2)}</pre>
                </div>

                <p>If you're receiving this email, your notification system is configured correctly! 🎉</p>
                <p>New user and application notifications should work properly.</p>
              </div>
            </body>
          </html>
        `,
      });

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        diagnostics,
        email_result: {
          id: emailData.data?.id,
          status: 'Sent to Resend'
        }
      });

    } catch (emailError: any) {
      return NextResponse.json({
        success: false,
        error: 'Email sending failed',
        diagnostics,
        email_error: {
          message: emailError.message,
          name: emailError.name,
          statusCode: emailError.statusCode
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
