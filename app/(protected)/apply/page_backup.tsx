'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ApplicationStatus = 'none' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export default function ApplyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    businessRole: '',
    company: '',
    message: '',
    consent: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuthAndApplication();
  }, []);

  const checkAuthAndApplication = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirectTo=/apply');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          fullName: profile.full_name || '',
          email: user.email || '',
        }));
      }

      // Check if user already has an application
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (existingApplication) {
        setApplicationStatus(existingApplication.status as ApplicationStatus);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking application:', err);
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone number validation (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number (e.g., +34612345678)';
    }

    // WhatsApp number validation
    if (!phoneRegex.test(formData.whatsappNumber.replace(/[\s-]/g, ''))) {
      errors.whatsappNumber = 'Please enter a valid WhatsApp number (e.g., +34612345678)';
    }

    // Business role required
    if (formData.businessRole.trim().length < 2) {
      errors.businessRole = 'Please enter your business role';
    }

    // Company required
    if (formData.company.trim().length < 2) {
      errors.company = 'Please enter your company name';
    }

    // Message minimum length (50 characters as per database constraint)
    if (formData.message.trim().length < 50) {
      errors.message = `Message must be at least 50 characters (currently ${formData.message.trim().length})`;
    }

    // Consent required
    if (!formData.consent) {
      errors.consent = 'You must agree to the terms to submit your application';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirectTo=/apply');
        return;
      }

      // Submit application
      const { error: submitError } = await supabase.from('applications').insert({
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        whatsapp_number: formData.whatsappNumber,
        business_role: formData.businessRole,
        company: formData.company,
        message: formData.message,
        consent_given: formData.consent,
        status: 'submitted',
      });

      if (submitError) {
        if (submitError.code === '23505') {
          // Duplicate key error
          setError('You have already submitted an application');
        } else {
          setError(submitError.message);
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show application status if already submitted
  if (applicationStatus !== 'none') {
    return (
      <div className="min-h-screen bg-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-navy mb-6">Application Status</h2>

            {applicationStatus === 'submitted' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  📝 Application Submitted
                </h3>
                <p className="text-blue-800">
                  Your application has been received and is awaiting review. We'll notify
                  you once it has been reviewed.
                </p>
              </div>
            )}

            {applicationStatus === 'under_review' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  🔍 Under Review
                </h3>
                <p className="text-yellow-800">
                  Your application is currently being reviewed by our team. This usually
                  takes 1-2 business days.
                </p>
              </div>
            )}

            {applicationStatus === 'approved' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Application Approved!
                </h3>
                <p className="text-green-800">
                  Congratulations! Your application has been approved. You now have access
                  to the member directory and WhatsApp group.
                </p>
              </div>
            )}

            {applicationStatus === 'rejected' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  ❌ Application Not Approved
                </h3>
                <p className="text-red-800">
                  Unfortunately, your application was not approved at this time. If you
                  have questions, please contact us.
                </p>
              </div>
            )}

            <div className="mt-8">
              <a
                href="/dashboard"
                className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 inline-block"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (success) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for applying to Bizcelona. We'll review your application and get
              back to you soon.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="min-h-screen bg-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-navy mb-2">Apply for Membership</h2>
          <p className="text-gray-600 mb-8">
            Complete the form below to apply to join the Bizcelona community
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-navy mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Verified from your account
              </p>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-navy mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="+34 612 345 678"
              />
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-navy mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="+34 612 345 678"
              />
              {validationErrors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.whatsappNumber}
                </p>
              )}
            </div>

            {/* Business Role */}
            <div>
              <label htmlFor="businessRole" className="block text-sm font-medium text-navy mb-2">
                Business / Role *
              </label>
              <input
                type="text"
                id="businessRole"
                name="businessRole"
                value={formData.businessRole}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="e.g., Startup Founder, Freelance Designer, Marketing Director"
              />
              {validationErrors.businessRole && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.businessRole}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-navy mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="Your company name"
              />
              {validationErrors.company && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.company}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-navy mb-2">
                Tell us about yourself *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent transition-all duration-200"
                placeholder="What do you do? What are you working on? How can you contribute to the community? (minimum 50 characters)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.message.length} / 50 characters minimum
              </p>
              {validationErrors.message && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
              )}
            </div>

            {/* Consent */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I consent to being contacted by Bizcelona and understand that my
                  application will be reviewed personally. *
                </span>
              </label>
              {validationErrors.consent && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.consent}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-saffron text-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <a
                href="/dashboard"
                className="px-6 py-4 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
