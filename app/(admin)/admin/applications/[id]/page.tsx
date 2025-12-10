import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isUserAdmin } from '@/lib/admin';
import Link from 'next/link';
import ApplicationActions from './ApplicationActions';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin/applications');
  }

  // Check admin status
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get application details
  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (!application) {
    redirect('/admin/applications');
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/applications"
            className="text-saffron hover:text-orange-600 font-semibold mb-4 inline-block"
          >
            ← Back to Applications
          </Link>
          <h1 className="text-4xl font-bold text-navy mb-2">Application Review</h1>
          <p className="text-gray-600">Review and approve/reject this application</p>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-lg p-4 mb-6 ${
            application.status === 'submitted'
              ? 'bg-yellow-50 border-l-4 border-yellow-500'
              : application.status === 'under_review'
              ? 'bg-blue-50 border-l-4 border-blue-500'
              : application.status === 'approved'
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-red-50 border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                Status:{' '}
                <span className="uppercase">
                  {application.status.replace('_', ' ')}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Submitted on {new Date(application.created_at).toLocaleDateString()} at{' '}
                {new Date(application.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-navy mb-6">Applicant Information</h2>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg text-gray-900 mt-1">{application.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900 mt-1">{application.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">WhatsApp Number</label>
                <p className="text-lg text-gray-900 mt-1">{application.whatsapp_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Industry / Sector</label>
                <p className="text-lg text-gray-900 mt-1">{application.industry_sector}</p>
              </div>
            </div>

            {/* Professional Info */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-navy mb-4">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Title</label>
                  <p className="text-lg text-gray-900 mt-1">{application.job_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Business / Employer</label>
                  <p className="text-lg text-gray-900 mt-1">{application.employer_business}</p>
                </div>
              </div>
            </div>

            {/* Long-form Responses */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-navy mb-4">Responses</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">What do you do?</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.what_do_you_do}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">What are you hoping to get from Bizcelona?</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.hoping_to_get}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">What do you hope to bring to Bizcelona?</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.hope_to_bring}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-navy mb-4">Additional Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">LinkedIn Profile</label>
                  <p className="text-gray-900 mt-1">
                    <a
                      href={application.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-saffron hover:text-orange-600 underline"
                    >
                      {application.linkedin_profile}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">How did they hear about Bizcelona?</label>
                  <p className="text-gray-900 mt-1">{application.how_heard_about}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Contributor Interest</label>
                  <p className="text-gray-900 mt-1">
                    {application.contributor_interest ? (
                      <span className="text-green-600 font-semibold">✓ Yes - Interested in being an integral part</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </p>
                </div>

                {application.additional_info && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Additional Information</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.additional_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <ApplicationActions application={application} userId={user.id} />
      </div>
    </div>
  );
}
