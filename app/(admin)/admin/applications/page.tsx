import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isUserAdmin } from '@/lib/admin';
import Link from 'next/link';
import { AdminNav } from '../AdminNav';
import { ApplicationsTable, type ApplicationRow } from './ApplicationsTable';

export default async function ApplicationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
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
  const { status } = await searchParams;
  const statusFilter = status || 'all';

  // Build query
  let query = supabase
    .from('applications')
    .select('id, user_id, full_name, email, job_title, employer_business, status, created_at')
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: applications } = await query;

  // Fetch slugs for applicant profiles separately (avoids FK ambiguity with reviewed_by)
  const userIds = (applications ?? []).map((a) => a.user_id).filter(Boolean) as string[];
  const { data: profileSlugs } = userIds.length > 0
    ? await supabase.from('profiles').select('id, slug').in('id', userIds)
    : { data: [] };

  const slugByUserId = new Map((profileSlugs ?? []).map((p) => [p.id, p.slug]));

  const rows: ApplicationRow[] = (applications ?? []).map((a) => ({
    ...a,
    slug: a.user_id ? (slugByUserId.get(a.user_id) ?? null) : null,
  }));

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminNav active="applications" />
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
          {rows.length > 0 ? (
            <ApplicationsTable initialRows={rows} />
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
