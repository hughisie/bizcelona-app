import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isUserAdmin } from '@/lib/admin';
import Link from 'next/link';
import { AdminNav } from './AdminNav';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  // Check admin status
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get application statistics
  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });

  const { count: pendingApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted');

  const { count: approvedApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: rejectedApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  // Get total registered users (profiles)
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get recent signups who have NOT yet submitted an application
  const { data: recentSignups } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get IDs of profiles that have applications
  const { data: profilesWithApps } = await supabase
    .from('applications')
    .select('user_id');

  const appliedUserIds = new Set((profilesWithApps || []).map((a) => a.user_id));

  const signupsWithoutApplication = (recentSignups || []).filter(
    (profile) => !appliedUserIds.has(profile.id)
  );

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminNav active="home"/>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage Bizcelona applications and members</p>
          </div>
          <Link
            href="/admin/applications"
            className="bg-saffron text-navy px-6 py-3 rounded-lg font-semibold hover:bg-orange-400 transition-all duration-200"
          >
            View All Applications →
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600">Registered Users</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{totalUsers || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Accounts created</p>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold text-navy mt-2">{totalApplications || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Forms submitted</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600">Pending Review</p>
            <p className="text-3xl font-bold text-saffron mt-2">{pendingApplications || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting decision</p>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{approvedApplications || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Accepted members</p>
          </div>

          {/* Rejected */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{rejectedApplications || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Not approved</p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Recent Signups WITHOUT Applications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-1">Signed Up — No Application Yet</h2>
            <p className="text-sm text-gray-500 mb-4">These users created an account but haven't submitted their application form</p>
            {signupsWithoutApplication.length > 0 ? (
              <div className="space-y-3">
                {signupsWithoutApplication.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{profile.full_name || 'No name'}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(profile.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                      No Application
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">All registered users have submitted applications</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Link
              href="/admin/applications"
              className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-navy mb-2">Review Applications</h3>
              <p className="text-gray-600 mb-3">View and manage all submitted applications</p>
              <span className="text-saffron font-semibold">View All Applications →</span>
            </Link>
            <div className="bg-navy rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Application Pipeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Registered users:</span>
                  <span className="font-bold">{totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Submitted applications:</span>
                  <span className="font-bold">{totalApplications || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Yet to apply:</span>
                  <span className="font-bold text-saffron">{(totalUsers || 0) - (totalApplications || 0)}</span>
                </div>
                <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                  <span className="text-gray-300">Pending review:</span>
                  <span className="font-bold text-yellow-400">{pendingApplications || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy">Recent Applications</h2>
            <Link href="/admin/applications" className="text-saffron font-semibold text-sm hover:text-orange-600">
              View all →
            </Link>
          </div>
          {recentApplications && recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.full_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.employer_business || application.company || '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'submitted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/applications/${application.id}`} className="text-saffron hover:text-orange-600 font-semibold">
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No applications yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
