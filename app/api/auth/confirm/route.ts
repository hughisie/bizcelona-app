import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/reset-password';

  // Verify we have the required parameters
  if (!token_hash || !type) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid reset link`);
  }

  const supabase = await createClient();

  // Verify the OTP token
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  });

  if (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Redirect to the password reset page
  // The session is now established via cookies
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
