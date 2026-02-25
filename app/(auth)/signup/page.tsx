'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function validateWhatsApp(number: string): string | null {
  const clean = number.replace(/[\s\-()]/g, '');
  if (!clean) return 'WhatsApp number is required';
  if (!clean.startsWith('+')) return 'Must start with + and country code (e.g. +34612345678)';
  const digits = clean.slice(1);
  if (!/^\d+$/.test(digits)) return 'Only digits allowed after the + sign';
  if (digits.length < 10) return `Too short — must have at least 10 digits after + (you have ${digits.length})`;
  if (digits.length > 15) return 'Too long — maximum 15 digits';
  return null;
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleWhatsappChange = (value: string) => {
    setWhatsappNumber(value);
    if (value) {
      setWhatsappError(validateWhatsApp(value) || '');
    } else {
      setWhatsappError('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const whatsappValidationError = validateWhatsApp(whatsappNumber);
    if (whatsappValidationError) {
      setWhatsappError(whatsappValidationError);
      return;
    }

    const cleanWhatsapp = whatsappNumber.replace(/[\s\-()]/g, '');

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: cleanWhatsapp,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Send admin notification + welcome email to user
        try {
          await fetch('/api/notifications/new-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email,
              fullName,
              whatsappNumber: cleanWhatsapp,
            }),
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }

        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          router.push('/apply');
        }, 3000);
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Please check your email to verify your account. We've also sent you a welcome email with next steps.
            </p>
            <p className="text-sm text-gray-500">Redirecting you to the application form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-navy">Join Bizcelona</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to apply for membership
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron sm:text-sm"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron sm:text-sm"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron sm:text-sm ${
                  whatsappError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+34612345678"
                value={whatsappNumber}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                disabled={loading}
              />
              {whatsappError ? (
                <p className="mt-1 text-xs text-red-600">{whatsappError}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Include country code — e.g. +34 for Spain, +44 for UK, +1 for USA
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron sm:text-sm"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-saffron focus:border-saffron sm:text-sm"
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
              disabled={loading || !!whatsappError}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-navy bg-saffron hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-saffron hover:text-orange-400">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
