import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-navy mb-6">
            Welcome to Bizcelona! 👋
          </h1>

          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Hello <span className="font-semibold text-saffron">{profile?.full_name || 'there'}</span>!
            </p>
            <p className="text-gray-600">
              You are successfully logged in. Your authentication system is working perfectly!
            </p>
          </div>

          <div className="bg-beige p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-navy mb-4">Your Account Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Email Confirmed:</span> {user.email_confirmed_at ? '✅ Yes' : '⏳ Pending'}</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
            <p className="text-blue-800">
              The full dashboard with member directory, application form, and admin panel is coming soon!
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="/"
              className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              ← Back to Home
            </a>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="bg-gray-200 text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
