'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const supabase = createClient();
      const token_hash = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type');
      const code = searchParams.get('code');

      // Determine destination based on type
      const isRecovery = type === 'recovery';
      const defaultNext = isRecovery ? '/reset-password' : '/dashboard';
      const next = searchParams.get('next') || defaultNext;
      const errorRedirect = (msg: string) =>
        isRecovery
          ? `/reset-password?error=${encodeURIComponent(msg)}`
          : `/login?error=${encodeURIComponent(msg)}`;

      // OAuth-style code flow
      if (code && !token_hash) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.push(errorRedirect(error.message));
          return;
        }
        router.push(next);
        return;
      }

      // OTP flow (both signup and recovery)
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        if (error) {
          router.push(errorRedirect(error.message));
          return;
        }
        router.push(next);
        return;
      }

      // Nothing to work with
      router.push(errorRedirect('No valid token found'));
    };

    run();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
        <p className="text-navy text-lg">Verifying…</p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-navy text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthConfirm />
    </Suspense>
  );
}
