import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify the request is authenticated and user is admin
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

    // Determine which message to send based on contributor interest
    const isContributor = application.contributor_interest;

    const contributorMessage = `
      <p>Dear ${application.full_name},</p>

      <p>Firstly, thank you for taking the time to apply to join our new Bizcelona community. We enjoyed reading your application and your set of skills and experiences and are delighted to welcome you to the community. Right now we are in the soft launch phase, so congratulations on being one of our original members. This will give you a chance to shape the community as we look to build the best community.</p>

      <p>You will shortly be added or receive an invite to the main group where we will be organising a more formal introduction and start sharing our ideas and plans to make this community the best around. Please note, that we are an active community and we want people that will contribute and participate in the discussion and helping others.</p>

      <p>We operate a mantra which is <strong>"give before you take"</strong> so please have this in mind.</p>

      <p>You did mention that you would like to be a contributor, and to shape the community - this is appreciated and we will be in touch shortly to see how you might be able to help us to build this community.</p>

      <p>In the meantime, please follow our page on LinkedIn: <a href="https://www.linkedin.com/company/110331955">https://www.linkedin.com/company/110331955</a></p>

      <p>See you in the groups!</p>
    `;

    const standardMessage = `
      <p>Dear ${application.full_name},</p>

      <p>Firstly, thank you for taking the time to apply to join our new Bizcelona community. We enjoyed reading your application and your set of skills and experiences and are delighted to welcome you to the community. Right now we are in the soft launch phase, so congratulations on being one of our original members. This will give you a chance to shape the community as we look to build the best community.</p>

      <p>You will shortly be added or receive an invite to the main group where we will be organising a more formal introduction and start sharing our ideas and plans to make this community the best around. Please note, that we are an active community and we want people that will contribute and participate in the discussion and helping others.</p>

      <p>We operate a mantra which is <strong>"give before you take"</strong> so please have this in mind.</p>

      <p>In the meantime, please follow our page on LinkedIn: <a href="https://www.linkedin.com/company/110331955">https://www.linkedin.com/company/110331955</a></p>

      <p>See you in the groups!</p>
    `;

    const messageContent = isContributor ? contributorMessage : standardMessage;

    // Send approval email to applicant
    // From: owen@bizcelona.com (or onboarding@resend.dev if domain not verified)
    // CC: matthew@bizcelona.com
    const emailData = await resend.emails.send({
      from: 'Owen Hughes - Bizcelona <onboarding@resend.dev>',
      to: application.email,
      cc: 'matthew@bizcelona.com',
      subject: '🎉 Welcome to Bizcelona - Application Approved!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .badge {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #9ca3af;
                font-size: 12px;
              }
              a {
                color: #f6ad55;
                text-decoration: none;
              }
              a:hover {
                text-decoration: underline;
              }
              strong {
                color: #1e3a5f;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Bizcelona! 🎉</h1>
            </div>
            <div class="content">
              <div class="badge">✅ APPLICATION APPROVED</div>

              ${messageContent}

              <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0;"><strong>Next Steps:</strong></p>
                <p style="margin: 10px 0 0 0;">Watch your WhatsApp for the group invite. We'll be in touch very soon!</p>
              </div>
            </div>
            <div class="footer">
              <p>Bizcelona - Barcelona's Premier Business Community</p>
              <p>This email was sent from owen@bizcelona.com</p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      data: emailData,
      message: 'Approval email sent successfully'
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { error: 'Failed to send approval email' },
      { status: 500 }
    );
  }
}
