import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
  : ['admin@bizcelona.com'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, fullName, whatsappNumber } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email required' }, { status: 400 });
    }

    const firstName = fullName ? fullName.split(' ')[0] : 'there';
    const applyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.bizcelona.com'}/apply`;

    // Send admin notification
    await resend.emails.send({
      from: 'Bizcelona <info@bizcelona.com>',
      to: ADMIN_EMAILS,
      subject: `New User Signup: ${fullName || email}`,
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
                <div class="field"><div class="label">Name:</div><div class="value">${fullName || 'Not provided'}</div></div>
                <div class="field"><div class="label">Email:</div><div class="value">${email}</div></div>
                <div class="field"><div class="label">WhatsApp:</div><div class="value">${whatsappNumber ? `<a href="https://wa.me/${whatsappNumber.replace('+', '')}">${whatsappNumber}</a>` : 'Not provided'}</div></div>
                <div class="field"><div class="label">Signed Up:</div><div class="value">${new Date().toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                  <strong>⏳ Next Step:</strong> They have been sent a welcome email prompting them to complete their application. A reminder will be sent automatically if they don't apply within 48 hours.
                </p>
              </div>
              <div class="footer"><p>Bizcelona Admin Notifications</p></div>
            </div>
          </body>
        </html>
      `,
    });

    // Send welcome email to the new user
    await resend.emails.send({
      from: 'Bizcelona <info@bizcelona.com>',
      to: [email],
      subject: 'Welcome to Bizcelona — Complete Your Application',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f0e8; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: #1e3a5f; padding: 40px 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .header p { color: #94a3b8; margin: 8px 0 0; font-size: 15px; }
              .content { padding: 40px; }
              .step { display: flex; align-items: flex-start; margin-bottom: 20px; }
              .step-num { background: #f59e0b; color: #1e3a5f; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-right: 14px; margin-top: 2px; }
              .cta { text-align: center; margin: 36px 0; }
              .cta a { display: inline-block; background: #f59e0b; color: #1e3a5f; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 17px; font-weight: 700; }
              .note { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px 20px; border-radius: 4px; font-size: 14px; color: #0369a1; margin-top: 24px; }
              .footer { background: #f8fafc; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Bizcelona, ${firstName}!</h1>
                <p>Barcelona's premier invite-only business community</p>
              </div>
              <div class="content">
                <p style="font-size: 16px; color: #374151;">Your account has been created. You're one step away from joining Barcelona's most exclusive network of entrepreneurs, executives, and digital nomads.</p>

                <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 12px;">Here's what happens next:</p>

                <div class="step">
                  <div class="step-num">1</div>
                  <div><strong>Verify your email</strong> — Check your inbox for a confirmation email and click the link to activate your account.</div>
                </div>
                <div class="step">
                  <div class="step-num">2</div>
                  <div><strong>Complete your application</strong> — Tell us about yourself, your business, and what you hope to get from and bring to the community.</div>
                </div>
                <div class="step">
                  <div class="step-num">3</div>
                  <div><strong>We review your application</strong> — Our team personally reviews every application within 3–5 days.</div>
                </div>
                <div class="step">
                  <div class="step-num">4</div>
                  <div><strong>Get access</strong> — Approved members receive the WhatsApp group link and full community access.</div>
                </div>

                <div class="cta">
                  <a href="${applyUrl}">Complete My Application →</a>
                </div>

                <div class="note">
                  <strong>Note:</strong> Applications are reviewed personally by our founding team. We keep the community small and curated to ensure the highest quality of connections.
                </div>
              </div>
              <div class="footer">
                <p>© Bizcelona · Barcelona, Spain</p>
                <p>Questions? Reply to this email and we'll get back to you.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
