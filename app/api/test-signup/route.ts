import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Test database connection
    const { data: testQuery, error: queryError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    // Test auth service
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      database_connection: queryError ? '❌ Failed' : '✅ Connected',
      database_error: queryError?.message || null,
      auth_service: sessionError ? '❌ Failed' : '✅ Available',
      auth_error: sessionError?.message || null,
      environment: process.env.NODE_ENV,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing',
      supabase_anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    return NextResponse.json({
      success: true,
      diagnostics,
      message: 'Supabase connection test'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
