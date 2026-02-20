import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: userError?.message,
      }, { status: 401 });
    }

    // Try to query admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Get all RLS policies on admins table
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_admin_policies')
      .single()
      .then(
        () => ({ data: 'RPC not available', error: null }),
        () => ({ data: 'RPC not available', error: null })
      );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed: !!user.email_confirmed_at,
      },
      admin_check: {
        is_admin: !!adminData,
        role: adminData?.role || null,
        error: adminError?.message || null,
        error_code: adminError?.code || null,
        error_details: adminError?.details || null,
      },
      policies: policies,
      diagnosis: !adminData
        ? adminError?.message?.includes('row-level security')
          ? 'RLS policy is blocking the query. You need to run the FIX_ADMIN_ACCESS.sql script.'
          : 'User is not in the admins table. You need to run the FIX_ADMIN_ACCESS.sql script.'
        : 'User is an admin and should be redirected to /admin',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
