import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  // Log all parameters for debugging
  console.log('Confirm endpoint called');
  console.log('Search params:', Object.fromEntries(requestUrl.searchParams));
  console.log('Hash:', requestUrl.hash);

  // Try to get token from different possible locations
  const token_hash = requestUrl.searchParams.get('token_hash') || requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type') || 'recovery';
  const next = requestUrl.searchParams.get('next') || '/reset-password';
  const code = requestUrl.searchParams.get('code');

  console.log('Extracted params:', { token_hash: token_hash ? 'exists' : 'null', type, next, code: code ? 'exists' : 'null' });

  // If we have a code parameter instead of token_hash, this is coming from a different flow
  if (code && !token_hash) {
    console.log('Got code parameter, trying exchangeCodeForSession');
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=${encodeURIComponent('Please try the password reset link from your email')}`
      );
    }

    console.log('Code exchange successful, redirecting to reset-password');
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Verify we have the required parameters for OTP verification
  if (!token_hash) {
    console.error('No token_hash or code found in request');
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${encodeURIComponent('Invalid reset link - no token found')}`
    );
  }

  const supabase = await createClient();

  console.log('Attempting OTP verification with token_hash');

  // Verify the OTP token
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  });

  if (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${encodeURIComponent(error.message)}`
    );
  }

  console.log('OTP verification successful, redirecting to reset-password');

  // Redirect to the password reset page
  // The session is now established via cookies
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
