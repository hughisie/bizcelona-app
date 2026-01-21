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
                <a
                  href={`https://wa.me/${application.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-green-600 hover:text-green-700 mt-1 inline-flex items-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {application.whatsapp_number}
                </a>
                <p className="text-xs text-gray-500 mt-1">Click to open in WhatsApp</p>
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
