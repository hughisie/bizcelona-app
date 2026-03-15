import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  // For password recovery, skip server-side code exchange.
  // The PKCE code verifier is stored in the browser's localStorage by the
  // client-side Supabase client, so it's not accessible here on the server.
  // Instead, pass the code to the client-side reset-password page which will
  // call exchangeCodeForSession() using the browser Supabase client.
  if (type === 'recovery') {
    const resetUrl = code
      ? `${origin}/reset-password?code=${code}`
      : `${origin}/reset-password`;
    return NextResponse.redirect(resetUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  let redirectPath = '/apply';

  if (next) {
    redirectPath = next;
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
