'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent running multiple times (React Strict Mode runs effects twice in dev)
    if (hasRun.current) return;
    hasRun.current = true;

    // Handle password reset by checking URL hash parameters
    const handlePasswordReset = async () => {
      const supabase = createClient();

      // Supabase redirects with hash parameters (not query params)
      // e.g., #access_token=...&refresh_token=...&type=recovery
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      console.log('Hash params:', { accessToken: accessToken ? 'exists' : 'null', refreshToken: refreshToken ? 'exists' : 'null', type });

      // If we have tokens in the hash, set the session
      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Setting session from hash tokens...');

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Error setting session from tokens:', error);
          setError('Invalid or expired reset link. Please request a new one.');
          return;
        }

        console.log('Session set successfully');

        // Clean up the hash
        window.history.replaceState({}, '', '/reset-password');

        setValidSession(true);
        return;
      }

      // Fallback: check if there's already a valid session
      console.log('Checking for existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setError('Invalid or expired reset link. Please request a new one.');
        return;
      }

      if (!session) {
        console.log('No session found - reset link may be expired');
        setError('Invalid or expired reset link. Please request a new one.');
      } else {
        console.log('Valid session found - user can reset password');
        setValidSession(true);
      }
    };

    handlePasswordReset();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your password has been updated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!validSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/forgot-password"
              className="inline-block bg-saffron text-navy px-6 py-3 rounded-lg font-medium hover:bg-orange-400 transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-navy">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a strong password for your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron focus:z-10 sm:text-sm"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron focus:z-10 sm:text-sm"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !validSession}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-navy bg-saffron hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-saffron hover:text-orange-400 font-medium"
            >
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
