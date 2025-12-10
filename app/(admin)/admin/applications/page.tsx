import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isUserAdmin } from '@/lib/admin';
import Link from 'next/link';

type SearchParams = {
  status?: string;
};

export default async function ApplicationsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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

  // Get filter status
  const statusFilter = searchParams.status || 'all';

  // Build query
  let query = supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: applications } = await query;

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-navy mb-2">Applications</h1>
              <p className="text-gray-600">Review and manage member applications</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-200 text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/applications"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Applications
            </Link>
            <Link
              href="/admin/applications?status=submitted"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'submitted'
                  ? 'bg-saffron text-navy'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Review
            </Link>
            <Link
              href="/admin/applications?status=under_review"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'under_review'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Under Review
            </Link>
            <Link
              href="/admin/applications?status=approved"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </Link>
            <Link
              href="/admin/applications?status=rejected"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </Link>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {applications && applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.job_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.employer_business}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === 'submitted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : application.status === 'under_review'
                              ? 'bg-blue-100 text-blue-800'
                              : application.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="text-saffron hover:text-orange-600 font-semibold"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all'
                  ? 'No applications have been submitted yet.'
                  : `No applications with status "${statusFilter}".`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
