import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only allow authenticated admins
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse admin emails
    const ADMIN_EMAILS = process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
      : [];

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        RESEND_API_KEY: {
          status: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
          length: process.env.RESEND_API_KEY?.length || 0,
          prefix: process.env.RESEND_API_KEY?.substring(0, 7) || 'N/A'
        },
        ADMIN_EMAIL: {
          status: process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing',
          value: process.env.ADMIN_EMAIL || 'Not configured',
          parsed_emails: ADMIN_EMAILS,
          count: ADMIN_EMAILS.length
        },
        NEXT_PUBLIC_APP_URL: {
          status: process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing',
          value: process.env.NEXT_PUBLIC_APP_URL || 'Not configured'
        },
        NEXT_PUBLIC_SUPABASE_URL: {
          status: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '⚠️ Missing'
        }
      }
    };

    return NextResponse.json({
      success: true,
      diagnostics,
      message: 'Environment variable check complete'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Diagnostic check failed',
      details: error.message
    }, { status: 500 });
  }
}
