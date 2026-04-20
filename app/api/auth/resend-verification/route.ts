import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!));
  }
  await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-confirm` },
  });
  return NextResponse.redirect(new URL('/dashboard?resent=1', process.env.NEXT_PUBLIC_APP_URL!));
}
