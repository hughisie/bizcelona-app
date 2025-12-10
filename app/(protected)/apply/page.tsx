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
    whatsappNumber: '',
    employerBusiness: '',
    jobTitle: '',
    industrySector: '',
    whatDoYouDo: '',
    hopingToGet: '',
    hopeToBring: '',
    linkedinProfile: '',
    howHeardAbout: '',
    contributorInterest: 'no' as 'yes' | 'no',
    additionalInfo: '',
    consent1: false,
    consent2: false,
    consent3: false,
    consent4: false,
    consent5: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuthAndApplication();
  }, []);

  const checkAuthAndApplication = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirectTo=/apply');
        return;
      }

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

    // Email validation - must contain @
    if (!formData.email.includes('@')) {
      errors.email = 'Email must contain @';
    }

    // WhatsApp validation - must start with + and have at least 10 digits
    const whatsappClean = formData.whatsappNumber.replace(/[\s-]/g, '');
    if (!whatsappClean.startsWith('+')) {
      errors.whatsappNumber = 'WhatsApp number must start with + (e.g., +34612345678)';
    } else if (whatsappClean.slice(1).length < 10) {
      errors.whatsappNumber = `WhatsApp must have at least 10 digits after + (currently ${whatsappClean.slice(1).length})`;
    } else if (!/^\+[0-9]{10,}$/.test(whatsappClean)) {
      errors.whatsappNumber = 'WhatsApp must be + followed by digits only (no spaces or dashes in final format)';
    }

    // Required text fields
    if (!formData.employerBusiness.trim()) {
      errors.employerBusiness = 'Business name or employer is required';
    }

    if (!formData.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    }

    if (!formData.industrySector.trim()) {
      errors.industrySector = 'Industry/Sector is required';
    }

    // Long-form required fields (minimum 50 characters)
    if (formData.whatDoYouDo.trim().length < 50) {
      errors.whatDoYouDo = `Please provide at least 50 characters (currently ${formData.whatDoYouDo.trim().length})`;
    }

    if (formData.hopingToGet.trim().length < 50) {
      errors.hopingToGet = `Please provide at least 50 characters (currently ${formData.hopingToGet.trim().length})`;
    }

    if (formData.hopeToBring.trim().length < 50) {
      errors.hopeToBring = `Please provide at least 50 characters (currently ${formData.hopeToBring.trim().length})`;
    }

    // LinkedIn profile required and must be valid URL
    if (!formData.linkedinProfile.trim()) {
      errors.linkedinProfile = 'LinkedIn profile is required';
    } else if (!formData.linkedinProfile.startsWith('http://') && !formData.linkedinProfile.startsWith('https://')) {
      errors.linkedinProfile = 'LinkedIn URL must start with https:// (e.g., https://www.linkedin.com/in/yourname/)';
    } else if (!formData.linkedinProfile.includes('linkedin.com')) {
      errors.linkedinProfile = 'Please provide a valid LinkedIn URL';
    }

    // How heard about required
    if (!formData.howHeardAbout.trim()) {
      errors.howHeardAbout = 'Please tell us how you heard about Bizcelona';
    }

    // All consent checkboxes required
    if (!formData.consent1 || !formData.consent2 || !formData.consent3 || !formData.consent4 || !formData.consent5) {
      errors.consent = 'All consent items must be checked';
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

      // Clean WhatsApp number - remove spaces and dashes for database storage
      const cleanWhatsapp = formData.whatsappNumber.replace(/[\s-]/g, '');

      const { error: submitError } = await supabase.from('applications').insert({
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        whatsapp_number: cleanWhatsapp,
        employer_business: formData.employerBusiness,
        job_title: formData.jobTitle,
        industry_sector: formData.industrySector,
        what_do_you_do: formData.whatDoYouDo,
        hoping_to_get: formData.hopingToGet,
        hope_to_bring: formData.hopeToBring,
        linkedin_profile: formData.linkedinProfile,
        how_heard_about: formData.howHeardAbout,
        contributor_interest: formData.contributorInterest === 'yes',
        additional_info: formData.additionalInfo || null,
        consent_given: true,
        status: 'submitted',
      });

      if (submitError) {
        if (submitError.code === '23505') {
          setError('You have already submitted an application');
        } else if (submitError.code === '23514') {
          // Check constraint violation - show user-friendly message
          if (submitError.message.includes('whatsapp')) {
            setError('WhatsApp number format is invalid. Must be + followed by at least 10 digits.');
          } else if (submitError.message.includes('what_do_you_do')) {
            setError('Please provide at least 50 characters for "What do you do?"');
          } else if (submitError.message.includes('hoping_to_get')) {
            setError('Please provide at least 50 characters for "What are you hoping to get from Bizcelona?"');
          } else if (submitError.message.includes('hope_to_bring')) {
            setError('Please provide at least 50 characters for "What do you hope to bring to Bizcelona?"');
          } else {
            setError('Please check that all required fields meet the minimum requirements.');
          }
        } else {
          setError(submitError.message);
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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

  if (applicationStatus !== 'none') {
    return (
      <div className="min-h-screen bg-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-navy mb-6">Application Status</h2>

            {applicationStatus === 'submitted' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Application Submitted</h3>
                <p className="text-blue-800">
                  Your application has been received and is awaiting review. We typically process applications within 3-5 days.
                </p>
              </div>
            )}

            {applicationStatus === 'under_review' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">🔍 Under Review</h3>
                <p className="text-yellow-800">
                  Your application is currently being reviewed by our team.
                </p>
              </div>
            )}

            {applicationStatus === 'approved' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Application Approved!</h3>
                <p className="text-green-800">
                  Congratulations! Your application has been approved. Welcome to Bizcelona!
                </p>
              </div>
            )}

            {applicationStatus === 'rejected' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Application Not Approved</h3>
                <p className="text-red-800">
                  Unfortunately, your application was not approved at this time.
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

  if (success) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for applying to Bizcelona. We'll review your application within 3-5 days and get back to you.
            </p>
            <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-navy mb-2">Bizcelona Community Application</h2>
          <p className="text-gray-600 mb-6">
            Complete the form below to apply to join the Bizcelona community. We typically process applications within 3-5 days.
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Verified from your account</p>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-navy mb-2">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
                placeholder="+34612345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Must start with + followed by at least 10 digits (no spaces)</p>
              {validationErrors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.whatsappNumber}</p>
              )}
            </div>

            {/* Business Name/Employer and Job Title in same row on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employer/Business */}
              <div>
                <label htmlFor="employerBusiness" className="block text-sm font-medium text-navy mb-2">
                  Business Name or Employer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="employerBusiness"
                  name="employerBusiness"
                  value={formData.employerBusiness}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                />
                {validationErrors.employerBusiness && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employerBusiness}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-navy mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                />
                {validationErrors.jobTitle && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.jobTitle}</p>
                )}
              </div>
            </div>

            {/* Industry/Sector */}
            <div>
              <label htmlFor="industrySector" className="block text-sm font-medium text-navy mb-2">
                Industry / Sector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="industrySector"
                name="industrySector"
                value={formData.industrySector}
                onChange={handleChange}
                required
                placeholder="e.g., Technology, Finance, Marketing, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              {validationErrors.industrySector && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.industrySector}</p>
              )}
            </div>

            {/* What do you do */}
            <div>
              <label htmlFor="whatDoYouDo" className="block text-sm font-medium text-navy mb-2">
                What do you do? (A one or two sentence intro) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="whatDoYouDo"
                name="whatDoYouDo"
                value={formData.whatDoYouDo}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.whatDoYouDo.length} / 50 characters minimum
              </p>
              {validationErrors.whatDoYouDo && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.whatDoYouDo}</p>
              )}
            </div>

            {/* What are you hoping to get */}
            <div>
              <label htmlFor="hopingToGet" className="block text-sm font-medium text-navy mb-2">
                What are you hoping to get from Bizcelona? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="hopingToGet"
                name="hopingToGet"
                value={formData.hopingToGet}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.hopingToGet.length} / 50 characters minimum
              </p>
              {validationErrors.hopingToGet && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.hopingToGet}</p>
              )}
            </div>

            {/* What do you hope to bring */}
            <div>
              <label htmlFor="hopeToBring" className="block text-sm font-medium text-navy mb-2">
                What do you hope to bring to Bizcelona? <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">We encourage a "give first" model</p>
              <textarea
                id="hopeToBring"
                name="hopeToBring"
                value={formData.hopeToBring}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.hopeToBring.length} / 50 characters minimum
              </p>
              {validationErrors.hopeToBring && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.hopeToBring}</p>
              )}
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label htmlFor="linkedinProfile" className="block text-sm font-medium text-navy mb-2">
                Please share your LinkedIn profile <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="linkedinProfile"
                name="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={handleChange}
                required
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Must be full URL (e.g., https://www.linkedin.com/in/owen-g/)</p>
              {validationErrors.linkedinProfile && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.linkedinProfile}</p>
              )}
            </div>

            {/* How did you hear about */}
            <div>
              <label htmlFor="howHeardAbout" className="block text-sm font-medium text-navy mb-2">
                How did you hear about Bizcelona? <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">(Include referrer's name if applicable)</p>
              <input
                type="text"
                id="howHeardAbout"
                name="howHeardAbout"
                value={formData.howHeardAbout}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              {validationErrors.howHeardAbout && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.howHeardAbout}</p>
              )}
            </div>

            {/* Contributor Interest */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Contributor Interest <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Are you interested in becoming an integral part of the new community?
              </p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contributorInterest"
                    value="yes"
                    checked={formData.contributorInterest === 'yes'}
                    onChange={handleChange}
                    className="h-4 w-4 text-saffron focus:ring-saffron border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contributorInterest"
                    value="no"
                    checked={formData.contributorInterest === 'no'}
                    onChange={handleChange}
                    className="h-4 w-4 text-saffron focus:ring-saffron border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Additional Info (Optional) */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-navy mb-2">
                Any other info you believe would be relevant (Optional)
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
            </div>

            {/* Consent Checkboxes */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-sm font-medium text-navy mb-4">
                Consent <span className="text-red-500">*</span>
              </p>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent1"
                    checked={formData.consent1}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I understand this is a closed, private WhatsApp group
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent2"
                    checked={formData.consent2}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I agree to follow the community guidelines
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent3"
                    checked={formData.consent3}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I will respect the privacy of all members and conversations
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent4"
                    checked={formData.consent4}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I consent to being contacted by Bizcelona regarding my application
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent5"
                    checked={formData.consent5}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-saffron focus:ring-saffron border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I understand my application will be reviewed personally and processed within 3-5 days
                  </span>
                </label>
              </div>
              {validationErrors.consent && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.consent}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
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
