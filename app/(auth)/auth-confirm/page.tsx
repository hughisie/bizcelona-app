'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const confirmAuth = async () => {
      const supabase = createClient();

      console.log('Auth confirm page loaded');
      console.log('Search params:', Object.fromEntries(searchParams));

      // Try to get token from different possible locations
      const token_hash = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type') || 'recovery';
      const next = searchParams.get('next') || '/reset-password';
      const code = searchParams.get('code');

      console.log('Extracted params:', { token_hash: token_hash ? 'exists' : 'null', type, next, code: code ? 'exists' : 'null' });

      // If we have a code parameter, try to exchange it
      if (code && !token_hash) {
        console.log('Got code parameter, trying exchangeCodeForSession');

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code:', error);
          router.push(`/reset-password?error=${encodeURIComponent('Please try the password reset link from your email')}`);
          return;
        }

        console.log('Code exchange successful, redirecting to', next);
        router.push(next);
        return;
      }

      // If we have a token_hash, verify the OTP
      if (token_hash) {
        console.log('Attempting OTP verification with token_hash');

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error('Error verifying OTP:', error);
          router.push(`/reset-password?error=${encodeURIComponent(error.message)}`);
          return;
        }

        console.log('OTP verification successful, redirecting to', next);
        router.push(next);
        return;
      }

      // No valid parameters found
      console.error('No valid token_hash or code found');
      router.push('/reset-password?error=' + encodeURIComponent('Invalid reset link - no token found'));
    };

    confirmAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
        <p className="text-navy text-lg">Verifying your reset link...</p>
      </div>
    </div>
  );
}
