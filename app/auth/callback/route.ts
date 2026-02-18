import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      // If there's an error, redirect to login with error message
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Determine redirect based on auth type or next parameter
  let redirectPath = '/apply';

  if (type === 'recovery') {
    // Password recovery flow - redirect to reset password page
    redirectPath = '/reset-password';
  } else if (next) {
    // Use the next parameter if provided
    redirectPath = next;
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
